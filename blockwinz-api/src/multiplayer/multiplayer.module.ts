/*
https://docs.nestjs.com/modules
*/

import { forwardRef, Module } from '@nestjs/common';
import { GameGateway } from './gateway/game.gateway';
import { GameSessionModule } from './game-session/game-session.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { PlayerSessionTrackerModule } from './players/player-session-tracker.module';
import { RedisService } from 'src/shared/services/redis.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { GameEngineModule } from './game-engine/game-engine.module';
import { MultiplayerOrchestratorModule } from './orchestrator/multiplayer-orchestrator.module';

@Module({
  imports: [
    MatchmakingModule,
    GameSessionModule,
    PlayerSessionTrackerModule,
    GameEngineModule,
    MultiplayerOrchestratorModule,
    forwardRef(() => AuthenticationModule),
  ],
  controllers: [],
  providers: [GameGateway, RedisService],
})
export class MultiplayerModule {}
