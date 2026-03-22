import { Injectable, Logger } from '@nestjs/common';

/**
 * Deprecated: multiplayer rules run in `MultiplayerSessionOrchestrator` via `MultiplayerGameRegistry`.
 * Retained for backwards-compatible Nest DI wiring.
 */
@Injectable()
export class GameEngineService {
  private readonly logger = new Logger(GameEngineService.name);

  constructor() {
    this.logger.verbose(
      'GameEngineService is deprecated; use MultiplayerSessionOrchestrator',
    );
  }
}
