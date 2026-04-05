import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Keypair,
  Connection,
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { parseSolanaTransactions } from './solanaTransaction';
import bs58 from 'bs58';
import { Currency } from '@blockwinz/shared';

export interface SplTokenProfile {
  currency: Currency;
  mintAddressEnvKey: string;
  programId: PublicKey;
  decimals: number;
}

export const getSplTokenProfile = (currency: Currency): SplTokenProfile => {
  if (currency === Currency.BWZ) {
    return {
      currency: Currency.BWZ,
      mintAddressEnvKey: 'SOLANA_BLOCKWINZ_MINT_ADDRESS',
      programId: TOKEN_2022_PROGRAM_ID,
      decimals: 6, // BWZ uses 6 decimals based on transferBwzToUserWallet logic
    };
  }
  if (currency === Currency.USDT) {
    return {
      currency: Currency.USDT,
      mintAddressEnvKey: 'SOLANA_USDT_MINT_ADDRESS',
      programId: TOKEN_PROGRAM_ID,
      decimals: 6, // standard SPL USDT decimals
    };
  }
  throw new Error(`Unsupported SPL token: ${currency}`);
};

@Injectable()
export class SolanaCoreRepository {
  private readonly logger = new Logger(SolanaCoreRepository.name);
  private connection = new Connection(
    clusterApiUrl(this.config.get('SOLANA_NETWORK')),
  );
  constructor(
    @Inject(ConfigService)
    private config: ConfigService,
  ) {}

  async createWallet() {
    const newAccount = Keypair.generate();
    return {
      publicKey: newAccount.publicKey.toBase58(),
      address: newAccount.publicKey.toBase58(),
      WIF: newAccount.secretKey,
      privateKey: bs58.encode(newAccount.secretKey),
    };
  }

  async getSolBalance(address: string): Promise<number> {
    const wallet = new PublicKey(address);
    const balance = await this.connection.getBalance(wallet);
    return balance / LAMPORTS_PER_SOL;
  }

  /**
   * Get the balance of a specific SPL token for a given wallet address
   * @param address The wallet address to get the token balance for
   * @param profile The SPL token profile containing mint and program info
   * @returns The balance of the token for the given wallet address.
   */
  async getSplTokenBalance(profile: SplTokenProfile, address: string): Promise<number> {
    const owner = new PublicKey(address);
    const mint = new PublicKey(
      this.config.get(profile.mintAddressEnvKey),
    );
    const accounts = await this.connection.getParsedTokenAccountsByOwner(
      owner,
      { mint }, // filter by mint is sufficient
      'confirmed',
    );

    // To extract the balance:
    if (accounts.value.length > 0) {
      const balance =
        accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance;
    }
    return 0;
  }

  async getAllTransactions(
    address: string,
    startDate?: number,
    endDate?: number,
    limit: number = 20,
  ) {
    const pubKey = new PublicKey(address);

    // Get all signatures first
    const transactionSignatures = await this.connection.getSignaturesForAddress(
      pubKey,
      { limit: 1000 }, // Get more signatures to filter by date
      'confirmed',
    );

    // Filter signatures by date if provided
    let filteredSignatures = transactionSignatures;
    if (startDate || endDate) {
      filteredSignatures = transactionSignatures.filter((sig) => {
        const timestamp = sig.blockTime * 1000; // Convert to milliseconds
        if (startDate && endDate) {
          return timestamp >= startDate && timestamp <= endDate;
        } else if (startDate) {
          return timestamp >= startDate;
        } else if (endDate) {
          return timestamp <= endDate;
        }
        return true;
      });
    }

    // Limit the filtered results
    filteredSignatures = filteredSignatures.slice(0, limit);

    // Get transaction details for filtered signatures
    const transactions = await Promise.all(
      filteredSignatures.map(async (tx) => {
        return await this.connection.getParsedTransaction(tx.signature, {
          commitment: 'confirmed',
        });
      }),
    );

    return (
      await parseSolanaTransactions(
        this.connection,
        transactions as any,
        address,
      )
    ).filter((tx) => tx.direction !== 'unknown');
  }

  /**
   * Transfers SOL from a custodial user wallet to a recipient address using a central fee payer.
   * @param senderSecretKey Secret key of custodial user wallet (owns SOL)
   * @param recipientAddress PublicKey of recipient
   * @param centralFeePayerSecretKey Secret key of central fee payer with enough SOL for fees
   * @param amount SOL amount to transfer
   */
  async transferSOLWithFeePayer({
    senderSecretKey,
    recipientAddress,
    centralFeePayerSecretKey,
    amount,
  }: {
    senderSecretKey: string;
    recipientAddress: string;
    centralFeePayerSecretKey: string;
    amount: number;
  }) {
    try {
      // Decode secret keys
      const senderKeypair = Keypair.fromSecretKey(bs58.decode(senderSecretKey));
      const feePayerKeypair = Keypair.fromSecretKey(
        bs58.decode(centralFeePayerSecretKey),
      );
      const recipientPubkey = new PublicKey(recipientAddress);

      if (amount <= 0) {
        throw new BadRequestException('Invalid transfer amount.');
      }

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderKeypair.publicKey,
          toPubkey: recipientPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        }),
      );

      // Set fee payer
      transaction.feePayer = feePayerKeypair.publicKey;

      // Fetch recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Sign transaction with both fee payer and sender
      transaction.sign(feePayerKeypair, senderKeypair);

      // Send and confirm transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [feePayerKeypair, senderKeypair],
      );

      this.logger.log('SOL transfer successful with signature:', signature);
      return signature;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to complete SOL transfer with fee payer: ${error.message}`,
      );
    }
  }

  /**
   * Transfers SOL from the main BlockWinz wallet to a user wallet using the central fee payer
   * @param userAddress The recipient's wallet address
   * @param amount Amount of SOL to transfer
   */
  async transferSolToUserWallet(userAddress: string, amount: number) {
    const blockWinzPrivateKey = this.config.get('SOLANA_BLOCKWINZ_PRIVATE_KEY');
    const centralFeePayerSecretKey = this.config.get(
      'SOLANA_BLOCKWINZ_PRIVATE_KEY',
    );

    return await this.transferSOLWithFeePayer({
      senderSecretKey: blockWinzPrivateKey,
      recipientAddress: userAddress,
      amount,
      centralFeePayerSecretKey,
    });
  }

  /**
   * Transfers SPL tokens from a custodial user wallet to a recipient address using a central fee payer.
   */
  async transferSplTokenWithFeePayer(
    profile: SplTokenProfile,
    {
      senderSecretKey,
      recipientAddress,
      centralFeePayerSecretKey,
      amount,
    }: {
      senderSecretKey: string;
      recipientAddress: string;
      centralFeePayerSecretKey: string;
      amount: number;
    }
  ) {
    // Decode secret keys
    const senderKeypair = Keypair.fromSecretKey(bs58.decode(senderSecretKey));
    const feePayerKeypair = Keypair.fromSecretKey(
      bs58.decode(centralFeePayerSecretKey),
    );
    const recipientPubkey = new PublicKey(recipientAddress);
    const mintPubkey = new PublicKey(
      this.config.get(profile.mintAddressEnvKey),
    );

    // Derive associated token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      senderKeypair.publicKey,
      false,
      profile.programId,
    );
    const recipientTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      recipientPubkey,
      false,
      profile.programId,
    );

    const transaction = new Transaction();

    // Check if recipient's token account exists; if not, create it
    const recipientAccountInfo = await this.connection.getAccountInfo(
      recipientTokenAccount,
    );
    if (!recipientAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          feePayerKeypair.publicKey,
          recipientTokenAccount,
          recipientPubkey,
          mintPubkey,
          profile.programId,
        ),
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        senderKeypair.publicKey,
        amount,
        [],
        profile.programId,
      ),
    );

    // Set fee payer
    transaction.feePayer = feePayerKeypair.publicKey;

    // Fetch recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Sign transaction with both fee payer and sender
    transaction.sign(feePayerKeypair, senderKeypair);

    // Send and confirm transaction
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [feePayerKeypair, senderKeypair],
    );

    this.logger.log(`SPL Token transfer signature:`, signature);
    return signature;
  }

  async transferSplTokenToUserWallet(profile: SplTokenProfile, userAddress: string, amount: number) {
    // Treasury for tokens is the central wallet
    const treasuryPrivateKey = this.config.get('SOLANA_BLOCKWINZ_PRIVATE_KEY');
    const centralFeePayerSecretKey = this.config.get(
      'SOLANA_BLOCKWINZ_PRIVATE_KEY',
    );

    const amountInSmallestUnit = Math.round(amount * Math.pow(10, profile.decimals));

    return await this.transferSplTokenWithFeePayer(profile, {
      senderSecretKey: treasuryPrivateKey,
      recipientAddress: userAddress,
      amount: amountInSmallestUnit,
      centralFeePayerSecretKey,
    });
  }

  isValidSolanaAddress(address: string): boolean {
    try {
      const pubkey = new PublicKey(address);
      return PublicKey.isOnCurve(pubkey.toBytes());
    } catch (e) {
      throw new Error('Invalid address');
    }
  }
}
