import { Test } from '@nestjs/testing';
import { TicTacToeMultiplayerPlugin } from './tictactoe-multiplayer.plugin';
import { TicTacToeService } from '../game-engine/services/tictactoe.service';
import { DbGameSchema } from '@blockwinz/shared';
import { TicTacToeStatus, XOTurn } from 'src/games/tictactoe/enums/tictactoe.enums';
import type { MultiplayerTicTacToeDto } from '../game-engine/types/multiplayer-tictactoe.types';

describe('TicTacToeMultiplayerPlugin', () => {
  let plugin: TicTacToeMultiplayerPlugin;

  const mockTicTacToeService = {
    GetGameBySessionId: jest.fn(),
    CreateGame: jest.fn(),
    updateGame: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        TicTacToeMultiplayerPlugin,
        { provide: TicTacToeService, useValue: mockTicTacToeService },
      ],
    }).compile();
    plugin = moduleRef.get(TicTacToeMultiplayerPlugin);
  });

  const baseCtx = {
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    gameType: DbGameSchema.TicTacToeGame,
    players: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    betAmount: 1,
    currency: 'USD',
  };

  const baseState = (): MultiplayerTicTacToeDto => ({
    id: 'game-row-id',
    sessionId: baseCtx.sessionId,
    board: [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ],
    betResultStatus: TicTacToeStatus.IN_PROGRESS,
    players: [
      {
        userId: baseCtx.players[0],
        userIs: XOTurn.X,
        playerIsNext: true,
      },
      {
        userId: baseCtx.players[1],
        userIs: XOTurn.O,
        playerIsNext: false,
      },
    ],
    currentTurn: XOTurn.X,
    winner: null,
    winnerId: null,
    moveHistory: [],
    afkPlayers: [],
  });

  it('validateMove rejects when it is not the user turn', () => {
    const state = baseState();
    const r = plugin.validateMove(baseCtx, state, baseCtx.players[1], {
      row: 0,
      col: 0,
    });
    expect(r).toBe('It is not your turn');
  });

  it('applyMove places mark and switches turn', () => {
    const state = baseState();
    const out = plugin.applyMove(baseCtx, state, baseCtx.players[0], {
      row: 1,
      col: 1,
    });
    expect(out.terminal).toBe(false);
    expect(out.newState.board[1][1]).toBe('X');
    expect(out.newState.currentTurn).toBe(XOTurn.O);
  });

  it('applyMove detects row win', () => {
    const state: MultiplayerTicTacToeDto = {
      ...baseState(),
      board: [
        ['X', 'X', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      currentTurn: XOTurn.X,
    };
    const out = plugin.applyMove(baseCtx, state, baseCtx.players[0], {
      row: 0,
      col: 2,
    });
    expect(out.terminal).toBe(true);
    expect(out.outcome?.winnerUserIds?.[0]).toBe(baseCtx.players[0]);
  });
});
