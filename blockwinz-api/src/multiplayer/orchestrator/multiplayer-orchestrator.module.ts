import { forwardRef, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from 'src/database/database.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { GameSessionModule } from '../game-session/game-session.module';
import { GameEngineModule } from '../game-engine/game-engine.module';
import { MultiplayerSettlementModule } from '../settlement/multiplayer-settlement.module';
import { MultiplayerSessionOrchestrator } from './multiplayer-session-orchestrator.service';

@Module({
  imports: [
    forwardRef(() => GameSessionModule),
    GameEngineModule,
    DatabaseModule,
    EventEmitterModule,
    forwardRef(() => WalletModule),
    MultiplayerSettlementModule,
  ],
  providers: [MultiplayerSessionOrchestrator],
  exports: [MultiplayerSessionOrchestrator],
})
export class MultiplayerOrchestratorModule {}
