import { forwardRef, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GameSessionService } from './game-session.service';
import { MatchFoundListener } from './listeners/match-found.listener';
import { DatabaseModule } from 'src/database/database.module';
import { MultiplayerOrchestratorModule } from '../orchestrator/multiplayer-orchestrator.module';

@Module({
  imports: [
    EventEmitterModule,
    DatabaseModule,
    forwardRef(() => MultiplayerOrchestratorModule),
  ],
  providers: [GameSessionService, MatchFoundListener],
  exports: [GameSessionService],
})
export class GameSessionModule {}
