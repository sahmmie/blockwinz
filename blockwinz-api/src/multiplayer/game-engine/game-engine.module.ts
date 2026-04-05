import { Module } from '@nestjs/common';
import { GameEngineService } from './game-engine.service';
import { TicTacToeService } from './services/tictactoe.service';
import { QuoridorService } from './services/quoridor.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from 'src/database/database.module';
import { MultiplayerGameRegistry } from '../plugins/multiplayer-game-registry.service';
import { TicTacToeMultiplayerPlugin } from '../plugins/tictactoe-multiplayer.plugin';
import { QuoridorMultiplayerPlugin } from '../plugins/quoridor-multiplayer.plugin';

@Module({
  imports: [EventEmitterModule, DatabaseModule],
  controllers: [],
  providers: [
    GameEngineService,
    TicTacToeService,
    QuoridorService,
    MultiplayerGameRegistry,
    TicTacToeMultiplayerPlugin,
    QuoridorMultiplayerPlugin,
  ],
  exports: [
    GameEngineService,
    TicTacToeService,
    QuoridorService,
    MultiplayerGameRegistry,
    TicTacToeMultiplayerPlugin,
    QuoridorMultiplayerPlugin,
  ],
})
export class GameEngineModule {}
