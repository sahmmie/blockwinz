import { WalletController } from './controllers/wallet.controller';
import { forwardRef, Module } from '@nestjs/common';
import { NeoCoreModule } from 'src/core/neoCore/neoCore.module';
import { SolWalletRepository } from './repositories/solWallet.repository';
import { WalletRepository } from './repositories/wallet.repository';
import { SolanaCoreModule } from 'src/core/solanaCore/solanaCore.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { BwzWalletRepository } from './repositories/bwzWallet.repository';
import { QueueModule } from 'src/core/queue/queue.module';

const controllers = [WalletController];

const customModules = [SolanaCoreModule, TransactionModule];

@Module({
  imports: [...customModules, NeoCoreModule, forwardRef(() => QueueModule)],
  controllers: [...controllers],
  providers: [SolWalletRepository, WalletRepository, BwzWalletRepository],
  exports: [SolWalletRepository, WalletRepository, BwzWalletRepository],
})
export class WalletModule {}
