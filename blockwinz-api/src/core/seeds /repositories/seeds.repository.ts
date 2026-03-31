import {
  BadRequestException,
  HttpException,
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import {
  CreateSeedRequestDto,
  GenerateClientSeedResponseDto,
  GenerateServerSeedsResponseDto,
  SeedDto,
} from '../dtos/seeds.dto';
import * as crypto from 'crypto';
import { SeedStatus } from '@blockwinz/shared';
import { eq, and } from 'drizzle-orm';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId, getSeedId } from 'src/shared/helpers/user.helper';
import { ActiveSeedPairDto } from 'src/shared/dtos/ActiveSeedPair.dto';
import {
  HG_ERROR_MESSAGES,
  HG_ERROR_CODES,
} from 'src/shared/errors/gamesErrors';
import { MinesGameStatus } from 'src/games/mines/enums/mines.enums';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { seeds } from 'src/database/schema/seeds';
import { minesGames } from 'src/database/schema/mines-games';
import { users } from 'src/database/schema/users';

@Injectable()
export class SeedsRepository {
  private readonly logger = new Logger('Seeds Service');

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  generateServerSeedAndHash(): GenerateServerSeedsResponseDto {
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const serverHash = crypto
      .createHash('sha256')
      .update(serverSeed)
      .digest('hex');
    this.logger.log('Generated server seed and hash');
    return { serverSeed, serverHash };
  }

  generateClientSeed(): GenerateClientSeedResponseDto {
    const length = Math.floor(Math.random() * (16 - 4 + 1)) + 4;
    const bytes = Math.ceil(length / 2);
    const buffer = crypto.randomBytes(bytes);
    const clientSeed = buffer.toString('hex').slice(0, length);
    this.logger.log('Generated client seed');
    return { clientSeed };
  }

  validatePlayerClientSeed(clientSeed: string): boolean {
    const regexp = /^[a-zA-Z0-9]{4,16}$/;
    return regexp.test(clientSeed);
  }

  async deactivateActiveSeed(seedId: string): Promise<SeedDto | null> {
    this.logger.log(`Deactivating seed with ID: ${seedId}`);
    const [seed] = await this.db
      .select()
      .from(seeds)
      .where(eq(seeds.id, seedId))
      .limit(1);
    if (seed) {
      await this.db
        .update(seeds)
        .set({
          deactivatedAt: new Date(),
          userId: null,
          status: SeedStatus.DEACTIVATED,
        } as Record<string, unknown>)
        .where(eq(seeds.id, seedId));
      this.logger.log(`Deactivated seed with ID: ${seedId}`);
      return this.toSeedDto({
        ...seed,
        deactivatedAt: new Date(),
        userId: null,
        status: SeedStatus.DEACTIVATED,
      });
    }
    this.logger.warn(`Seed with ID: ${seedId} not found`);
    return null;
  }

  async createSeed(
    request: CreateSeedRequestDto,
    tx?: DrizzleDb,
  ): Promise<SeedDto> {
    this.logger.log(
      `Creating seed for user ${typeof request.user === 'string' ? request.user : getUserId(request.user) || 'unknown'}`,
    );
    const db = tx ?? this.db;
    const userId =
      typeof request.user === 'string' ? request.user : getUserId(request.user);
    const [row] = await db
      .insert(seeds)
      .values({
        serverSeed: request.serverSeed,
        serverSeedHash: request.serverSeedHash,
        clientSeed: request.clientSeed,
        status: request.status,
        userId: userId || null,
      } as typeof seeds.$inferInsert)
      .returning();
    if (!row) throw new Error('Failed to create seed');
    this.logger.log(`Created seed with ID: ${row.id}`);
    return this.toSeedDto(row);
  }

  async rotatePlayerSeed(player: UserRequestI): Promise<ActiveSeedPairDto> {
    const playerId = getUserId(player);
    this.logger.log(`Rotating player seed. Player ID: ${playerId}`);

    const activeSeed = player.activeSeed as SeedDto | string;
    const clientSeed =
      typeof activeSeed === 'object' && activeSeed?.clientSeed
        ? activeSeed.clientSeed
        : '';
    if (!this.validatePlayerClientSeed(clientSeed)) {
      throw new BadRequestException('Invalid client seed');
    }
    await this.hasPlayerActiveGames(player);
    if (!player?.activeSeed) {
      throw new BadRequestException('Player does not have an active seed');
    }

    const activeSeedId =
      typeof activeSeed === 'object' && activeSeed?._id
        ? activeSeed._id
        : (activeSeed as string);

    const {
      serverSeed: newFutureServerSeed,
      serverHash: newFutureServerSeedHash,
    } = this.generateServerSeedAndHash();

    await this.deactivateActiveSeed(String(activeSeedId));

    const newSeed = await this.createSeed({
      serverSeed: player.futureServerSeed ?? '',
      serverSeedHash: player.futureServerSeedHash ?? '',
      clientSeed: player.futureClientSeed ?? '',
      status: SeedStatus.ACTIVE,
      user: playerId ?? '',
    });

    const { clientSeed: newFutureClientSeed } = this.generateClientSeed();

    await this.db
      .update(users)
      .set({
        nonce: 0,
        activeSeedId: getSeedId(newSeed),
        futureClientSeed: newFutureClientSeed,
        futureServerSeed: newFutureServerSeed,
        futureServerSeedHash: newFutureServerSeedHash,
      } as Record<string, unknown>)
      .where(eq(users.id, playerId!));

    return {
      nonce: 0,
      clientSeed: newSeed.clientSeed,
      serverSeedHashed: newSeed.serverSeedHash,
      futureClientSeed: newFutureClientSeed,
      futureServerSeedHashed: newFutureServerSeedHash,
    };
  }

  async hasPlayerActiveGames(player: UserRequestI) {
    if (!player) {
      this.logger.error(`Player not found`);
      throw new BadRequestException('Player not found.');
    }
    const playerId = getUserId(player);
    const [minesOpenGame] = await this.db
      .select()
      .from(minesGames)
      .where(
        and(
          eq(minesGames.userId, playerId!),
          eq(minesGames.betResultStatus, MinesGameStatus.OPEN),
        ),
      )
      .limit(1);
    if (minesOpenGame) {
      throw new HttpException(
        HG_ERROR_MESSAGES.OPENED_GAMES_WHEN_ROTATING_SEED_PAIR,
        HG_ERROR_CODES.OPENED_GAMES_WHEN_ROTATING_SEED_PAIR,
      );
    }
  }

  async getPlayerActiveSeedData(
    player: UserRequestI,
  ): Promise<ActiveSeedPairDto> {
    const activeSeedRaw = player.activeSeed;
    const activeSeedId =
      typeof activeSeedRaw === 'object' &&
      activeSeedRaw &&
      '_id' in activeSeedRaw
        ? String(activeSeedRaw._id)
        : String(activeSeedRaw);
    const [activeSeed] = await this.db
      .select()
      .from(seeds)
      .where(eq(seeds.id, activeSeedId))
      .limit(1);
    if (!activeSeed) {
      throw new BadRequestException('Active seed not found');
    }
    return {
      nonce: player.nonce ?? 0,
      clientSeed: activeSeed.clientSeed,
      serverSeedHashed: activeSeed.serverSeedHash,
      futureClientSeed: player.futureClientSeed ?? '',
      futureServerSeedHashed: player.futureServerSeedHash ?? '',
    };
  }

  private toSeedDto(row: typeof seeds.$inferSelect): SeedDto {
    return {
      _id: row.id,
      id: row.id,
      status: row.status as SeedStatus,
      clientSeed: row.clientSeed,
      serverSeed: row.serverSeed,
      serverSeedHash: row.serverSeedHash,
      createdAt: row.createdAt,
      deactivatedAt: row.deactivatedAt ?? undefined,
      user: row.userId ?? '',
    };
  }
}
