import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MultiplayerGameEmitterEvent } from '@blockwinz/shared';

/**
 * Legacy `game.finished` / `game.settled` hooks. Wallet settlement is handled by
 * `MultiplayerSettlementService` on terminal moves; this listener remains for optional metrics only.
 */
@Injectable()
export class GameFinishedListener {
  private readonly logger = new Logger(GameFinishedListener.name);

  /**
   * Logs completed games; does not move funds (settlement is authoritative).
   */
  @OnEvent(MultiplayerGameEmitterEvent.GAME_FINISHED)
  handleGameFinished(payload: {
    sessionId: string;
    winner: string | null;
    finalState: unknown;
  }): void {
    this.logger.verbose(
      `game.finished session=${payload.sessionId} winner=${payload.winner}`,
    );
  }

  /**
   * @deprecated Prefer `multiplayer.session.settled` from `MultiplayerSettlementService`.
   */
  @OnEvent('game.settled')
  handleGameSettled(): void {
    this.logger.verbose('game.settled received (deprecated path)');
  }
}
