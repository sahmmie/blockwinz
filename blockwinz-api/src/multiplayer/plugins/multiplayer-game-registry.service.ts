import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { DbGameSchema } from '@blockwinz/shared';
import type { MultiplayerGamePlugin } from './multiplayer-game-plugin.interface';
import { TicTacToeMultiplayerPlugin } from './tictactoe-multiplayer.plugin';
import { QuoridorMultiplayerPlugin } from './quoridor-multiplayer.plugin';

/**
 * Resolves the rule/persistence plugin for a `DbGameSchema` multiplayer title.
 */
@Injectable()
export class MultiplayerGameRegistry implements OnModuleInit {
  private readonly logger = new Logger(MultiplayerGameRegistry.name);
  private readonly plugins = new Map<
    DbGameSchema,
    MultiplayerGamePlugin<unknown, unknown>
  >();

  constructor(
    private readonly ticTacToeMultiplayerPlugin: TicTacToeMultiplayerPlugin,
    private readonly quoridorMultiplayerPlugin: QuoridorMultiplayerPlugin,
  ) {}

  /**
   * Registers built-in plugins. Additional games register here when implemented.
   */
  onModuleInit(): void {
    this.register(this.ticTacToeMultiplayerPlugin);
    this.register(this.quoridorMultiplayerPlugin);
  }

  /**
   * @throws Error when the game type has no multiplayer plugin.
   */
  get(gameType: DbGameSchema): MultiplayerGamePlugin<unknown, unknown> {
    const p = this.plugins.get(gameType);
    if (!p) {
      throw new Error(`No multiplayer plugin registered for ${gameType}`);
    }
    return p;
  }

  tryGet(
    gameType: DbGameSchema,
  ): MultiplayerGamePlugin<unknown, unknown> | undefined {
    return this.plugins.get(gameType);
  }

  private register(plugin: MultiplayerGamePlugin<unknown, unknown>): void {
    this.plugins.set(plugin.gameType, plugin);
    this.logger.log(`Registered multiplayer plugin: ${plugin.gameType}`);
  }
}
