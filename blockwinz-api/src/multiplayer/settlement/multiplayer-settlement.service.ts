import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { Currency } from '@blockwinz/shared';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { gameSessions } from 'src/database/schema/game-sessions';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import type { UserDto } from 'src/shared/dtos/user.dto';
import type { MultiplayerGameOutcome } from '../plugins/multiplayer-game-plugin.interface';
import type { GameSessionDocument } from '../game-session/game-session.service';
import { GameHistoryService } from '../game-history/game-history.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MultiplayerSessionStatus } from '../game-session/interfaces/game-session.interface';

function asUser(id: string): UserDto {
  return { _id: id } as UserDto;
}

/**
 * Single idempotent pipeline for wallet + history when a multiplayer session ends.
 */
@Injectable()
export class MultiplayerSettlementService {
  private readonly logger = new Logger(MultiplayerSettlementService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    @Inject(forwardRef(() => WalletRepository))
    private readonly walletRepository: WalletRepository,
    private readonly gameHistoryService: GameHistoryService,
    private readonly eventEmitter: EventEmitter2,
    private readonly config: ConfigService,
  ) {}

  /**
   * Applies payouts/refunds once per session. Uses `settled_at` on `game_sessions` as idempotency guard.
   *
   * @param session — hydrated session row (must include `players`, `betAmount`, `currency`)
   * @param outcome — normalized terminal outcome from the game plugin
   * @param finalState — opaque state snapshot for history (e.g. multiplayer game DTO)
   */
  async settleSession(
    session: GameSessionDocument,
    outcome: MultiplayerGameOutcome,
    finalState: unknown,
  ): Promise<void> {
    const sessionId = session._id ?? session.id;
    if (!sessionId) {
      throw new Error('Session id required for settlement');
    }

    await this.db.transaction(async (tx) => {
      const txDb = tx as unknown as DrizzleDb;
      const [row] = await txDb
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.id, sessionId))
        .limit(1);

      if (!row) {
        throw new Error(`Session ${sessionId} not found`);
      }
      if (row.settledAt) {
        this.logger.verbose(`Session ${sessionId} already settled; skipping`);
        return;
      }

      const bet = Number(row.betAmount);
      const currency = row.currency as Currency;
      const players = (row.players ?? []).map(String);

      if (bet > 0 && players.length >= 2) {
        if (outcome.isDraw) {
          for (const pid of players) {
            await this.walletRepository.releaseBetFunds(
              asUser(pid),
              bet,
              currency,
              txDb,
            );
          }
        } else if (outcome.winnerUserIds.length === 1) {
          const winnerId = outcome.winnerUserIds[0];
          const loserId = players.find((p) => p !== winnerId);
          if (!loserId) {
            throw new Error('Could not resolve loser for settlement');
          }
          await this.walletRepository.releaseBetFunds(
            asUser(winnerId),
            bet,
            currency,
            txDb,
          );
          await this.walletRepository.releaseBetFunds(
            asUser(loserId),
            bet,
            currency,
            txDb,
          );
          await this.walletRepository.debitPlayer(
            asUser(loserId),
            bet,
            currency,
            txDb,
          );
          const pot = bet * 2;
          const rakeBps = Math.min(
            10_000,
            Math.max(
              0,
              Number(this.config.get('MULTIPLAYER_RAKE_BPS', 0)),
            ),
          );
          const rakeReceiver = this.config.get<string>(
            'MULTIPLAYER_RAKE_RECEIVER_USER_ID',
          );
          let winnerCredit = pot;
          if (rakeBps > 0 && rakeReceiver) {
            const rakeAmount = Math.floor((pot * rakeBps) / 10_000);
            winnerCredit = pot - rakeAmount;
            if (rakeAmount > 0) {
              await this.walletRepository.creditPlayer(
                asUser(rakeReceiver),
                rakeAmount,
                currency,
                txDb,
              );
            }
          }
          await this.walletRepository.creditPlayer(
            asUser(winnerId),
            winnerCredit,
            currency,
            txDb,
          );
        }
      }

      await txDb
        .update(gameSessions)
        .set({
          settledAt: new Date(),
          gameStatus: MultiplayerSessionStatus.COMPLETED,
          updatedAt: new Date(),
        } as Record<string, unknown>)
        .where(eq(gameSessions.id, sessionId));

      await this.gameHistoryService.saveGameResult({
        sessionId,
        gameId: row.gameId ?? sessionId,
        players,
        moves: (finalState as { moveHistory?: unknown[] })?.moveHistory,
        finalState,
        winner: outcome.winnerUserIds[0] ?? null,
        betAmount: bet,
        createdAt: row.createdAt ?? new Date(),
        finishedAt: new Date(),
      });
    });

    this.eventEmitter.emit('multiplayer.session.settled', {
      sessionId,
      outcome,
    });
    this.logger.log(`Settled multiplayer session ${sessionId}`);
  }
}
