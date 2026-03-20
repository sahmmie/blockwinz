import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as _ from 'lodash';
import {
  FairLogicByteGeneratorDto,
  FairLogicGenerateFloatsDto,
  FairLogicBytesToFloatsDto,
} from '../dtos/fairLogic.dto';
import { UserDto } from 'src/shared/dtos/user.dto';
import { SeedDto } from 'src/core/seeds /dtos/seeds.dto';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId } from 'src/shared/helpers/user.helper';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { users } from 'src/database/schema/users';
import { seeds } from 'src/database/schema/seeds';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class FairLogicRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private *byteGenerator(
    request: FairLogicByteGeneratorDto,
  ): IterableIterator<number> {
    const { serverSeed, clientSeed, nonce, cursor } = request;
    let currentRound = Math.floor(cursor / 32);
    let currentRoundCursor = cursor;
    currentRoundCursor -= currentRound * 32;

    while (true) {
      const hmac = crypto.createHmac('sha256', serverSeed);
      hmac.update(`${clientSeed}:${nonce}:${currentRound}`);
      const buffer = hmac.digest();

      while (currentRoundCursor < 32) {
        yield Number(buffer[currentRoundCursor]);
        currentRoundCursor += 1;
      }

      currentRoundCursor = 0;
      currentRound += 1;
    }
  }

  generateRequestsToFairLogic(
    player: UserDto,
    count: number,
    cursor: number,
  ): FairLogicGenerateFloatsDto {
    const request = {
      serverSeed: (player.activeSeed as SeedDto).serverSeed,
      clientSeed: (player.activeSeed as SeedDto).clientSeed,
      count,
      cursor,
      nonce: player.nonce,
    };
    return request;
  }

  generateFloatsForGame(request: FairLogicGenerateFloatsDto): number[] {
    const { serverSeed, clientSeed, count, cursor, nonce } = request;
    const randomNumbers = this.byteGenerator({
      serverSeed,
      clientSeed,
      nonce,
      cursor,
    });
    const bytes = [];

    while (bytes.length < count * 4) {
      bytes.push(randomNumbers.next().value);
    }

    return this.convertBytesToFloats({ bytes });
  }

  private convertBytesToFloats(request: FairLogicBytesToFloatsDto) {
    return _.chunk(request.bytes, 4).map((bytesChunk) =>
      bytesChunk.reduce((result, value, i) => {
        const divider = 256 ** (i + 1);
        const partialResult = value / divider;
        return result + partialResult;
      }, 0),
    );
  }

  public async updatePlayerNonce(
    player: UserRequestI,
    tx?: DrizzleDb,
  ): Promise<UserRequestI> {
    const db = tx ?? this.db;
    const userId = String(getUserId(player));

    const [updatedUser] = await db
      .update(users)
      .set({
        nonce: sql`${users.nonce} + 1`,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new BadRequestException('Player not found');
    }

    let seedRow: typeof seeds.$inferSelect | null = null;
    if (updatedUser.activeSeedId) {
      const [s] = await db
        .select()
        .from(seeds)
        .where(eq(seeds.id, updatedUser.activeSeedId))
        .limit(1);
      seedRow = s ?? null;
    }

    const activeSeed = seedRow
      ? ({
          _id: seedRow.id,
          id: seedRow.id,
          clientSeed: seedRow.clientSeed,
          serverSeed: seedRow.serverSeed,
          serverSeedHash: seedRow.serverSeedHash,
          status: seedRow.status,
          deactivatedAt: seedRow.deactivatedAt ?? undefined,
        } as SeedDto)
      : undefined;

    return {
      ...player,
      _id: updatedUser.id,
      id: updatedUser.id,
      nonce: updatedUser.nonce,
      activeSeed,
      futureClientSeed: updatedUser.futureClientSeed ?? undefined,
      futureServerSeed: updatedUser.futureServerSeed ?? undefined,
      futureServerSeedHash: updatedUser.futureServerSeedHash ?? undefined,
    } as UserRequestI;
  }
}
