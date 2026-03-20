import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MatchmakingService } from './matchmaking.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [MatchmakingService],
  exports: [MatchmakingService],
})
export class MatchmakingModule {}
