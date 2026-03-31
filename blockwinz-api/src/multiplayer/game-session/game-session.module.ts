import { forwardRef, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GameSessionService } from './game-session.service';
import { MatchFoundListener } from './listeners/match-found.listener';
import { LobbyExpiryListener } from './listeners/lobby-expiry.listener';
import { DatabaseModule } from 'src/database/database.module';
import { MultiplayerOrchestratorModule } from '../orchestrator/multiplayer-orchestrator.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { SharedModule } from 'src/shared/shared.module';
import { RematchService } from '../rematch/rematch.service';

@Module({
  imports: [
    EventEmitterModule,
    DatabaseModule,
    WalletModule,
    SharedModule,
    forwardRef(() => MultiplayerOrchestratorModule),
  ],
  providers: [
    GameSessionService,
    RematchService,
    MatchFoundListener,
    LobbyExpiryListener,
  ],
  exports: [GameSessionService, RematchService],
})
export class GameSessionModule {}
