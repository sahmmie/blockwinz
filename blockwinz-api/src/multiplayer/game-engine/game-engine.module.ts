import { Module } from '@nestjs/common';
import { GameEngineService } from './game-engine.service';
import { TicTacToeService } from './services/tictactoe.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [EventEmitterModule.forRoot(), DatabaseModule],
  controllers: [],
  providers: [GameEngineService, TicTacToeService],
})
export class GameEngineModule {}
