import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CONST,
  rpc,
  sc,
  tx,
  u,
  wallet as neoWallet,
} from '@cityofzion/neon-js';
import { getUrl } from '../helpers/urls';
const { Transaction } = tx;

@Injectable()
export class NeoCoreRepository {
  constructor(
    @Inject(ConfigService)
    public config: ConfigService,
  ) {}

  public async createWallet(): Promise<InstanceType<typeof neoWallet.Account>> {
    const newAccount = new neoWallet.Account(neoWallet.generatePrivateKey());
    return newAccount;
  }

  public async queryNep17Balances(address: string) {
    const neoClient = new rpc.RPCClient(
      await getUrl(this.config.get<string>('NEO_ENV')),
    );
    const nep17Balances = await neoClient.getNep17Balances(address);
    return nep17Balances.balance; // Ensure compatibility with your DTOs
  }

  public async queryNep17Transfers(
    address: string,
    startDate: string,
    endDate: string,
  ): Promise<unknown> {
    const neoClient = new rpc.RPCClient(
      await getUrl(this.config.get<string>('NEO_ENV')),
    );
    const nep17Transactions = await neoClient.getNep17Transfers(
      address,
      startDate,
      endDate,
    );
    return nep17Transactions;
  }

  public async transferNep17(
    fromPrivateKey: string,
    toAddress: string,
    amount: number,
    tokenScriptHash: string,
  ) {
    try {
      const fromAccount = new neoWallet.Account(fromPrivateKey);
      const toAccount = new neoWallet.Account(toAddress);

      this.validateTransferInputs(fromAccount, toAccount, amount);

      const script = this.createTransferScript(
        fromAccount.address,
        toAccount.address,
        amount,
        tokenScriptHash,
      );
      const transaction = await this.createTransaction(script, fromAccount);

      await this.estimateNetworkFee(transaction);
      await this.estimateSystemFee(transaction);

      const signedTransaction = this.signTransaction(transaction, fromAccount);
      return await this.broadcastTransaction(signedTransaction);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to complete NEP-17 transfer: ${error.message}`,
      );
    }
  }

  private validateTransferInputs(
    fromAccount: InstanceType<typeof neoWallet.Account>,
    toAccount: InstanceType<typeof neoWallet.Account>,
    amount: number,
  ) {
    if (!fromAccount || !toAccount || amount <= 0) {
      throw new BadRequestException('Invalid transfer inputs.');
    }
  }

  private createTransferScript(
    fromAddress: string,
    toAddress: string,
    amount: number,
    tokenScriptHash: string,
  ) {
    return sc.createScript({
      scriptHash: tokenScriptHash,
      operation: 'transfer',
      args: [
        sc.ContractParam.hash160(fromAddress),
        sc.ContractParam.hash160(toAddress),
        amount,
        sc.ContractParam.any(),
      ],
    } as any);
  }

  private async createTransaction(
    script: string,
    fromAccount: InstanceType<typeof neoWallet.Account>,
  ) {
    try {
      const neoClient = new rpc.RPCClient(
        await getUrl(this.config.get<string>('NEO_ENV')),
      );
      const currentHeight = await neoClient.getBlockCount();
      return new tx.Transaction({
        signers: [
          {
            account: fromAccount.scriptHash,
            scopes: tx.WitnessScope.CalledByEntry,
          },
        ],
        validUntilBlock: currentHeight + 1000,
        script,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create transaction.');
    }
  }

  private async estimateNetworkFee(
    transaction: InstanceType<typeof Transaction>,
  ) {
    try {
      const neoClient = new rpc.RPCClient(
        await getUrl(this.config.get<string>('NEO_ENV')),
      );
      const feePerByteInvokeResponse = await neoClient.invokeFunction(
        CONST.NATIVE_CONTRACT_HASH.PolicyContract,
        'getFeePerByte',
      );
      const feePerByte = u.BigInteger.fromNumber(
        feePerByteInvokeResponse.stack[0].value as string,
      );

      const transactionByteSize = transaction.serialize().length / 2 + 109;
      const witnessProcessingFee = u.BigInteger.fromNumber(1000390);

      transaction.networkFee = feePerByte
        .mul(transactionByteSize)
        .add(witnessProcessingFee);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to estimate network fees.',
      );
    }
  }

  private async estimateSystemFee(
    transaction: InstanceType<typeof Transaction>,
  ) {
    try {
      const neoClient = new rpc.RPCClient(
        await getUrl(this.config.get<string>('NEO_ENV')),
      );
      const invokeFunctionResponse = await neoClient.invokeScript(
        u.HexString.fromHex(transaction.script),
        transaction.signers,
      );
      transaction.systemFee = u.BigInteger.fromNumber(
        invokeFunctionResponse.gasconsumed,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to estimate system fees.');
    }
  }

  private signTransaction(
    transaction: InstanceType<typeof Transaction>,
    fromAccount: InstanceType<typeof neoWallet.Account>,
  ) {
    const networkMagic =
      this.config.get<string>('NEO_ENV') === 'MainNet'
        ? CONST.MAGIC_NUMBER.MainNet
        : CONST.MAGIC_NUMBER.TestNet;

    try {
      return transaction.sign(fromAccount, networkMagic);
    } catch (error) {
      throw new InternalServerErrorException('Failed to sign transaction.');
    }
  }

  private async broadcastTransaction(
    transaction: InstanceType<typeof Transaction>,
  ) {
    try {
      const neoClient = new rpc.RPCClient(
        await getUrl(this.config.get<string>('NEO_ENV')),
      );
      return await neoClient.sendRawTransaction(
        u.HexString.fromHex(transaction.serialize(true)),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to broadcast transaction.',
        error.message,
      );
    }
  }
}
