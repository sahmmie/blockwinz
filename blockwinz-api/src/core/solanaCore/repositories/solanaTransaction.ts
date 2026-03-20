import {
  Connection,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
} from '@solana/web3.js';
import { RawSolanaTransaction } from 'src/shared/interfaces/rawSolanaTransaction.interface';

/**
 * Parses raw Solana transaction data into a standardized format
 * @param rawTransactions - Array of raw Solana transaction data
 * @param userWalletAddress - The user's wallet address to determine transaction direction
 * @returns Array of parsed SolanaTransaction objects
 */
export async function parseSolanaTransactions(
  connection: Connection,
  rawTransactions: RawSolanaTransaction[],
  userWalletAddress?: string,
): Promise<any[]> {
  return Promise.all(
    rawTransactions.map((tx) =>
      parseTransaction(connection, tx, userWalletAddress),
    ),
  );
}

async function parseTransaction(
  connection: Connection,
  tx: RawSolanaTransaction,
  userWalletAddress?: string,
): Promise<any> {
  const isConfirmed = tx.meta.err === null && tx.meta.status.Ok !== undefined;
  const transactionHash = tx.transaction.signatures[0];
  const fee = tx.meta.fee / LAMPORTS_PER_SOL; // Convert fee from lamports to SOL
  const timestamp = tx.blockTime;

  // Check for token transfers first
  const tokenTransfer = await parseTokenTransfer(
    connection,
    tx,
    userWalletAddress,
  );
  if (tokenTransfer) {
    return {
      fee,
      confirmed: isConfirmed,
      transactionHash,
      amount: tokenTransfer.amount,
      to: tokenTransfer.to,
      from: tokenTransfer.from,
      timestamp,
      tokenHash: tokenTransfer.tokenHash,
      direction: tokenTransfer.direction,
    };
  }

  // Check for SOL transfers
  const solTransfer = parseSOLTransfer(tx, userWalletAddress);
  if (solTransfer) {
    return {
      fee,
      confirmed: isConfirmed,
      transactionHash,
      amount: solTransfer.amount,
      to: solTransfer.to,
      from: solTransfer.from,
      timestamp,
      direction: solTransfer.direction,
    };
  }

  // Fallback for unknown transaction types
  return {
    fee,
    confirmed: isConfirmed,
    transactionHash,
    amount: 0,
    to: '',
    from: '',
    timestamp,
    direction: 'unknown',
  };
}

async function parseTokenTransfer(
  connection: Connection,
  tx: RawSolanaTransaction,
  userWalletAddress?: string,
) {
  const validTransferTypes = ['transferChecked', 'transfer'];
  const validPrograms = ['spl-token', 'spl-token-2022'];

  // Helper function to check if an instruction is a valid token transfer
  const isTokenTransfer = (instruction: any) => {
    return (
      validTransferTypes.includes(instruction.parsed?.type) &&
      validPrograms.includes(instruction.program)
    );
  };

  // Check main instructions
  const transferInstruction =
    tx.transaction.message.instructions.find(isTokenTransfer);

  // If no transfer found in main instructions, check inner instructions
  if (!transferInstruction && tx.meta?.innerInstructions) {
    for (const inner of tx.meta.innerInstructions) {
      const innerTransfer = inner.instructions.find(isTokenTransfer);
      if (innerTransfer) {
        return parseTransferInfo(
          connection,
          innerTransfer,
          tx,
          userWalletAddress,
        );
      }
    }
  }

  if (!transferInstruction) return null;

  return parseTransferInfo(
    connection,
    transferInstruction,
    tx,
    userWalletAddress,
  );
}

async function parseTransferInfo(
  connection: Connection,
  instruction: any,
  tx: RawSolanaTransaction,
  userWalletAddress?: string,
) {
  const info = instruction.parsed.info;
  const amount = parseFloat(info.tokenAmount?.uiAmountString || info.amount);
  const tokenHash = info.mint;

  const [toWallet, fromWallet] = await Promise.all([
    getParsedAccountInfo(connection, info.destination),
    getParsedAccountInfo(connection, info.source),
  ]);

  const from = getTokenAccountOwner(tx, fromWallet);
  const to = getTokenAccountOwner(tx, toWallet);

  let direction: 'sent' | 'received' | 'unknown' = 'unknown';
  if (userWalletAddress) {
    if (from === userWalletAddress) {
      direction = 'sent';
    } else if (to === userWalletAddress) {
      direction = 'received';
    }
  }

  return {
    amount,
    tokenHash,
    from,
    to,
    direction,
  };
}

function parseSOLTransfer(
  tx: RawSolanaTransaction,
  userWalletAddress?: string,
) {
  // Look for system transfer instructions
  const transferInstruction = tx.transaction.message.instructions.find(
    (instruction) =>
      instruction.parsed?.type === 'transfer' &&
      instruction.program === 'system',
  );

  if (!transferInstruction) return null;

  const info = transferInstruction.parsed.info;
  const amount = info.lamports / LAMPORTS_PER_SOL; // Convert lamports to SOL
  const from = info.source;
  const to = info.destination;

  let direction: 'sent' | 'received' | 'unknown' = 'unknown';
  if (userWalletAddress) {
    if (from === userWalletAddress) {
      direction = 'sent';
    } else if (to === userWalletAddress) {
      direction = 'received';
    }
  }

  return {
    amount,
    from,
    to,
    direction,
  };
}

function getTokenAccountOwner(
  tx: RawSolanaTransaction,
  tokenAccount: string,
): string {
  // Check post token balances for the owner
  const postBalance = tx.meta.postTokenBalances.find(
    (balance) => balance.accountIndex === getAccountIndex(tx, tokenAccount),
  );

  if (postBalance) return postBalance.owner;

  // Check pre token balances for the owner
  const preBalance = tx.meta.preTokenBalances.find(
    (balance) => balance.accountIndex === getAccountIndex(tx, tokenAccount),
  );

  if (preBalance) return preBalance.owner;

  return tokenAccount; // Fallback to the account address itself
}

function getAccountIndex(
  tx: RawSolanaTransaction,
  accountAddress: string,
): number {
  return tx.transaction.message.accountKeys.findIndex(
    (key) => key.pubkey === accountAddress,
  );
}

// Helper to resolve token account owner
async function getParsedAccountInfo(
  connection: Connection,
  tokenAccount: string,
): Promise<string> {
  const accountInfo = await connection.getParsedAccountInfo(
    new PublicKey(tokenAccount),
  );
  // The owner field is inside value.data.parsed.info.owner
  return (
    (accountInfo.value?.data as ParsedAccountData)?.parsed.info?.owner || ''
  );
}

export { parseTransaction };
