import { forwardRef, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GameSessionService } from './game-session.service';
import { MatchFoundListener } from './listeners/match-found.listener';
import { LobbyExpiryListener } from './listeners/lobby-expiry.listener';
import { DatabaseModule } from 'src/database/database.module';
import { MultiplayerOrchestratorModule } from '../orchestrator/multiplayer-orchestrator.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    EventEmitterModule,
    DatabaseModule,
    WalletModule,
    forwardRef(() => MultiplayerOrchestratorModule),
  ],
  providers: [GameSessionService, MatchFoundListener, LobbyExpiryListener],
  exports: [GameSessionService],
})
export class GameSessionModule {}
