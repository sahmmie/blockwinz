import { Injectable, Logger } from '@nestjs/common';
import { TicTacToeService } from './services/tictactoe.service';
import { DbGameSchema } from '@blockwinz/shared';
import { OnEvent } from '@nestjs/event-emitter';
import { GameSessionDocument } from '../game-session/game-session.service';
import { MultiplayerGameEmitterEvent } from 'src/shared/eventEmitters/gameEmitterEvent.enum';
import type { MultiplayerTicTacToeDto } from './types/multiplayer-tictactoe.types';
import {
  TicTacToeStatus,
  XOTurn,
} from 'src/games/tictactoe/enums/tictactoe.enums';

@Injectable()
export class GameEngineService {
  private readonly logger = new Logger(GameEngineService.name);

  constructor(private ticTacToeService: TicTacToeService) {}

  @OnEvent(MultiplayerGameEmitterEvent.SESSION_CREATED)
  public async handleGameCreated(payload: GameSessionDocument) {
    this.logger.verbose(MultiplayerGameEmitterEvent.SESSION_CREATED);
    console.log('GameEngineService.handleGameCreated', payload);
    switch (payload.gameType) {
      case DbGameSchema.TicTacToeGame:
        return await this.ticTacToeService.CreateGame(
          this.convertToTicTacToeDto(payload),
        );
      default:
        throw new Error('Invalid game type');
    }
  }

  private convertToTicTacToeDto(
    game: GameSessionDocument,
  ): MultiplayerTicTacToeDto {
    if (game.players && game.players.length >= 2) {
      throw new Error('You can only create a game with 1 player');
    }
    // Let's randomly assign the players to be X or O
    const userIs =
      Object.values(XOTurn)[
        Math.floor(Math.random() * Object.values(XOTurn).length)
      ];
    return {
      board: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      betResultStatus: TicTacToeStatus.NOT_STARTED,
      players: game.players.map((playerId) => ({
        playerIsNext: true,
        userId: playerId,
        userIs,
      })),
      currentTurn: userIs,
      winner: null,
      winnerId: null,
      moveHistory: [],
      sessionId: game._id ?? game.id,
      afkPlayers: [],
    };
  }
}
