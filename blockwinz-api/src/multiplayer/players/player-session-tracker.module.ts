import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PlayerSessionTrackerService } from './player-session-tracker.service';
import { DisconnectionListener } from './listeners/disconnection.listener';
import { AfkListener } from './listeners/afk.listener';

@Module({
  imports: [EventEmitterModule.forRoot(), ScheduleModule.forRoot()],
  providers: [PlayerSessionTrackerService, DisconnectionListener, AfkListener],
  exports: [PlayerSessionTrackerService],
})
export class PlayerSessionTrackerModule {}
