import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PayoutService } from '../payout.service';
import {
  GameHistoryService,
  GameResult,
} from '../../game-history/game-history.service';
import { WalletRepository } from '../../../wallet/repositories/wallet.repository';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { Currency } from 'src/shared/enums/currencies.enum';

@Injectable()
export class GameFinishedListener {
  private readonly logger = new Logger(GameFinishedListener.name);

  constructor(
    private readonly payoutService: PayoutService,
    private readonly gameHistoryService: GameHistoryService,
    @Inject(forwardRef(() => WalletRepository))
    private readonly walletRepository: WalletRepository,
  ) {}

  @OnEvent('game.finished')
  async handleGameFinished(payload: {
    sessionId: string;
    winner: string | null;
    finalState: any;
  }) {
    // Save game result
    const { sessionId, winner, finalState } = payload;
    const { gameId, players, betAmount, createdAt } = finalState;
    const result: GameResult = {
      sessionId,
      gameId,
      players,
      moves: finalState.moveHistory,
      finalState,
      winner,
      betAmount,
      createdAt,
      finishedAt: new Date(),
    };
    await this.gameHistoryService.saveGameResult(result);
    // Process payout if there is a winner
    if (winner) {
      await this.payoutService.processPayout(winner, betAmount * 2); // Example: winner takes all
    } else {
      this.logger.warn(`Game ${sessionId} ended with no winner (draw)`);
    }
  }

  @OnEvent('game.settled')
  async handleGameSettled(payload: {
    sessionId: string;
    gameId: string;
    winnerId: UserRequestI;
    loserId: UserRequestI;
    betAmount: number;
    payoutAmount: number;
    isDraw: boolean;
    finalScore: any;
    timestamp: Date;
  }) {
    const {
      sessionId,
      gameId,
      winnerId,
      loserId,
      betAmount,
      payoutAmount,
      isDraw,
      finalScore,
      timestamp,
    } = payload;
    // Validate integrity (anti-cheat, session complete, etc.)
    // For now, assume valid
    const currency: Currency = Currency.BWZ; // TODO: Make dynamic if needed
    if (isDraw) {
      if (winnerId && loserId) {
        await this.walletRepository.creditPlayer(winnerId, betAmount, currency);
        await this.walletRepository.creditPlayer(loserId, betAmount, currency);
      }
      this.logger.log(`Draw: refunded both players for session ${sessionId}`);
    } else if (winnerId) {
      await this.walletRepository.creditPlayer(
        winnerId,
        payoutAmount,
        currency,
      );
      this.logger.log(
        `Credited winner ${winnerId} with ${payoutAmount} for session ${sessionId}`,
      );
    }
    // Log to game history
    const result: GameResult = {
      sessionId,
      gameId,
      players: [winnerId.id, loserId.id].filter(Boolean) as string[],
      finalState: finalScore,
      winner: winnerId.id,
      betAmount,
      createdAt: timestamp,
      finishedAt: timestamp,
    };
    await this.gameHistoryService.saveGameResult(result);
    // Log payout event (simulate status)
    await this.payoutService.processPayout(winnerId.id || '', payoutAmount);
  }
}
