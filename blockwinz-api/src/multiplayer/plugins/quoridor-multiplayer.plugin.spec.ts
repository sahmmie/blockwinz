import { QuoridorMultiplayerPlugin } from './quoridor-multiplayer.plugin';
import { QuoridorService } from '../game-engine/services/quoridor.service';
import { DbGameSchema } from '@blockwinz/shared';
import { TicTacToeStatus } from 'src/games/tictactoe/enums/tictactoe.enums';
import { createInitialQuoridorState } from '@blockwinz/quoridor-engine';

describe('QuoridorMultiplayerPlugin', () => {
  const mockService = {} as unknown as QuoridorService;
  const plugin = new QuoridorMultiplayerPlugin(mockService);

  it('registers Quoridor game type', () => {
    expect(plugin.gameType).toBe(DbGameSchema.QuoridorGame);
  });

  it('rejects move when game not in progress', () => {
    const base = createInitialQuoridorState('a', 'b', 'a');
    const state = {
      ...base,
      sessionId: 's',
      betResultStatus: TicTacToeStatus.WIN,
      moveHistory: [],
    };
    const ctx = {
      sessionId: 's',
      gameType: DbGameSchema.QuoridorGame,
      players: ['a', 'b'],
      betAmount: 0,
      currency: 'USD',
    };
    const v = plugin.validateMove(ctx, state, 'a', {
      kind: 'pawn',
      to: { x: 4, y: 1 },
    });
    expect(v).not.toBe(true);
  });

  it('resolveTurnTimeout applies auto-move and advances turn', async () => {
    const base = createInitialQuoridorState('a', 'b', 'a');
    const state = {
      ...base,
      sessionId: 's',
      betResultStatus: TicTacToeStatus.IN_PROGRESS,
      moveHistory: [],
    };
    const ctx = {
      sessionId: 's',
      gameType: DbGameSchema.QuoridorGame,
      players: ['a', 'b'],
      betAmount: 0,
      currency: 'USD',
    };
    const result = await plugin.resolveTurnTimeout(ctx, state);
    expect(result).not.toBeNull();
    expect(result!.terminal).toBe(false);
    expect(result!.newState.currentTurnUserId).toBe('b');
    expect(result!.newState.moveHistory).toHaveLength(1);
  });
});
