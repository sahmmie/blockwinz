import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BetHistoryRepository } from './repositories/betHistory.repository';
import { BetHistoryDto } from './dtos/betHistory.dto';
import { getUserId } from 'src/shared/helpers/user.helper';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { PaginatedDataI } from 'src/shared/interfaces/pagination.interface';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { eq } from 'drizzle-orm';
import { DbGameSchema, SeedStatus } from '@blockwinz/shared';
import { seeds } from 'src/database/schema/seeds';
import { diceGames } from 'src/database/schema/dice-games';
import { limboGames } from 'src/database/schema/limbo-games';
import { minesGames } from 'src/database/schema/mines-games';
import { plinkoGames } from 'src/database/schema/plinko-games';
import { kenoGames } from 'src/database/schema/keno-games';
import { wheelGames } from 'src/database/schema/wheel-games';
import { tictactoeGames } from 'src/database/schema/tictactoe-games';
import { coinflipGames } from 'src/database/schema/coinflip-games';

const MAX_PAGE_SIZE = 50;

@Injectable()
export class BetHistoryService {
  constructor(
    private readonly betHistoryRepository: BetHistoryRepository,
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
  ) {}

  async getBetHistories(
    limit: number,
    page: number = 1,
    sortby: 'latest' | 'totalWinAmount' = 'latest',
  ): Promise<PaginatedDataI<BetHistoryDto>> {
    if (sortby !== 'latest' && sortby !== 'totalWinAmount') {
      throw new BadRequestException('Invalid sortby parameter');
    }
    if (!limit || !page) {
      throw new BadRequestException('Limit and page are required');
    }
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    }
    const offset = (page - 1) * limit;
    const { result, total } =
      await this.betHistoryRepository.findAllBetHistoriesPaginated(
        limit,
        offset,
        sortby,
      );
    return this.toPaginatedResponse(result, total, page, limit);
  }

  /**
   * Loads one bet history row with provably fair fields (and Coin Flip round params when applicable).
   *
   * @param betId - Bet history UUID
   * @returns Bet history DTO
   * @throws NotFoundException when the row does not exist
   */
  async getBetHistoryById(
    betId: string,
    requester: UserRequestI,
    isAdmin: boolean,
  ): Promise<BetHistoryDto> {
    const row = await this.betHistoryRepository.findBetHistoryById(betId);
    if (!row) {
      throw new NotFoundException('Bet not found');
    }
    const requesterId = getUserId(requester);
    if (!isAdmin && String(row.user) !== String(requesterId)) {
      throw new NotFoundException('Bet not found');
    }
    return this.attachFairnessFields(row);
  }

  /**
   * Join game row (nonce + seed_id) and seeds row for provably-fair verification UI.
   * For Coin Flip, also attaches `coins` / `min` / `side` / `results` from `coinflip_games`.
   *
   * @param dto - Bet history row
   * @returns Dto with optional seed fields and game-specific verify fields
   */
  private async attachFairnessFields(dto: BetHistoryDto): Promise<BetHistoryDto> {
    const pair = await this.findGameSeedNoncePair(dto.gameId, dto.gameType);
    if (!pair) {
      return dto;
    }
    const [seedRow] = await this.db
      .select()
      .from(seeds)
      .where(eq(seeds.id, pair.seedId))
      .limit(1);
    if (!seedRow) {
      return dto;
    }
    let out: BetHistoryDto = {
      ...dto,
      nonce: pair.nonce,
      clientSeed: seedRow.clientSeed,
      serverSeedHash: seedRow.serverSeedHash,
      serverSeed:
        seedRow.status === SeedStatus.DEACTIVATED
          ? seedRow.serverSeed
          : undefined,
      seedStatus: seedRow.status,
    };

    if (dto.gameType === DbGameSchema.CoinFlipGame) {
      const [cf] = await this.db
        .select({
          coins: coinflipGames.coins,
          min: coinflipGames.min,
          side: coinflipGames.side,
          results: coinflipGames.results,
        })
        .from(coinflipGames)
        .where(eq(coinflipGames.id, dto.gameId))
        .limit(1);
      if (cf) {
        out = {
          ...out,
          coinflipCoins: cf.coins,
          coinflipMin: cf.min,
          coinflipSide: cf.side,
          coinflipResults: cf.results ?? undefined,
        };
      }
    }

    return out;
  }

  private async findGameSeedNoncePair(
    gameId: string,
    gameType: DbGameSchema,
  ): Promise<{ seedId: string; nonce: number } | null> {
    switch (gameType) {
      case DbGameSchema.DiceGame: {
        const [r] = await this.db
          .select({ seedId: diceGames.seedId, nonce: diceGames.nonce })
          .from(diceGames)
          .where(eq(diceGames.id, gameId))
          .limit(1);
        return r ? { seedId: r.seedId, nonce: r.nonce } : null;
      }
      case DbGameSchema.LimboGame: {
        const [r] = await this.db
          .select({ seedId: limboGames.seedId, nonce: limboGames.nonce })
          .from(limboGames)
          .where(eq(limboGames.id, gameId))
          .limit(1);
        return r ? { seedId: r.seedId, nonce: r.nonce } : null;
      }
      case DbGameSchema.MinesGame: {
        const [r] = await this.db
          .select({ seedId: minesGames.seedId, nonce: minesGames.nonce })
          .from(minesGames)
          .where(eq(minesGames.id, gameId))
          .limit(1);
        return r ? { seedId: r.seedId, nonce: r.nonce } : null;
      }
      case DbGameSchema.PlinkoGame: {
        const [r] = await this.db
          .select({ seedId: plinkoGames.seedId, nonce: plinkoGames.nonce })
          .from(plinkoGames)
          .where(eq(plinkoGames.id, gameId))
          .limit(1);
        return r ? { seedId: r.seedId, nonce: r.nonce } : null;
      }
      case DbGameSchema.KenoGame: {
        const [r] = await this.db
          .select({ seedId: kenoGames.seedId, nonce: kenoGames.nonce })
          .from(kenoGames)
          .where(eq(kenoGames.id, gameId))
          .limit(1);
        return r ? { seedId: r.seedId, nonce: r.nonce } : null;
      }
      case DbGameSchema.WheelGame: {
        const [r] = await this.db
          .select({ seedId: wheelGames.seedId, nonce: wheelGames.nonce })
          .from(wheelGames)
          .where(eq(wheelGames.id, gameId))
          .limit(1);
        return r ? { seedId: r.seedId, nonce: r.nonce } : null;
      }
      case DbGameSchema.TicTacToeGame: {
        const [r] = await this.db
          .select({
            seedId: tictactoeGames.seedId,
            nonce: tictactoeGames.nonce,
          })
          .from(tictactoeGames)
          .where(eq(tictactoeGames.id, gameId))
          .limit(1);
        return r ? { seedId: r.seedId, nonce: r.nonce } : null;
      }
      case DbGameSchema.CoinFlipGame: {
        const [r] = await this.db
          .select({
            seedId: coinflipGames.seedId,
            nonce: coinflipGames.nonce,
          })
          .from(coinflipGames)
          .where(eq(coinflipGames.id, gameId))
          .limit(1);
        return r ? { seedId: r.seedId, nonce: r.nonce } : null;
      }
      case DbGameSchema.CrashGame:
      case DbGameSchema.RouletteGame:
        return null;
      default:
        return null;
    }
  }

  async getUserBetHistory(
    userId: string,
    limit: number,
    page: number,
  ): Promise<PaginatedDataI<BetHistoryDto>> {
    if (!limit || !page) {
      throw new BadRequestException('Limit and page are required');
    }
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    }
    const offset = (page - 1) * limit;
    const { result, total } =
      await this.betHistoryRepository.findUserBetHistoryPaginated(
        userId,
        limit,
        offset,
      );
    return this.toPaginatedResponse(result, total, page, limit);
  }

  private toPaginatedResponse(
    result: BetHistoryDto[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedDataI<BetHistoryDto> {
    const pages =
      limit > 0
        ? Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1)
        : [1];
    return {
      result,
      total,
      page,
      pages,
    };
  }
}
