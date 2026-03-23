import { forwardRef, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PlayerSessionTrackerService } from './player-session-tracker.service';
import { DisconnectionListener } from './listeners/disconnection.listener';
import { AfkListener } from './listeners/afk.listener';
import { DatabaseModule } from 'src/database/database.module';
import { MultiplayerOrchestratorModule } from '../orchestrator/multiplayer-orchestrator.module';

@Module({
  imports: [
    EventEmitterModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    forwardRef(() => MultiplayerOrchestratorModule),
  ],
  providers: [PlayerSessionTrackerService, DisconnectionListener, AfkListener],
  exports: [PlayerSessionTrackerService, DisconnectionListener],
})
export class PlayerSessionTrackerModule {}
