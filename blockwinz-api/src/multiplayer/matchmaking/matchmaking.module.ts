import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SharedModule } from 'src/shared/shared.module';
import { MatchmakingService } from './matchmaking.service';

@Module({
  imports: [EventEmitterModule, SharedModule],
  providers: [MatchmakingService],
  exports: [MatchmakingService],
})
export class MatchmakingModule {}
