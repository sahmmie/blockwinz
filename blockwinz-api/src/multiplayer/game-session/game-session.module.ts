import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GameSessionService } from './game-session.service';
import { MatchFoundListener } from './listeners/match-found.listener';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [EventEmitterModule.forRoot(), DatabaseModule],
  providers: [GameSessionService, MatchFoundListener],
  exports: [GameSessionService],
})
export class GameSessionModule {}
