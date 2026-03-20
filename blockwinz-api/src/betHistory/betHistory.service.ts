import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BetHistoryRepository } from './repositories/betHistory.repository';
import { BetHistoryDto } from './dtos/betHistory.dto';
import { PaginatedDataI } from 'src/shared/interfaces/pagination.interface';

const MAX_PAGE_SIZE = 50;

@Injectable()
export class BetHistoryService {
  constructor(private readonly betHistoryRepository: BetHistoryRepository) {}

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

  async getBetHistoryById(betId: string): Promise<BetHistoryDto> {
    const row = await this.betHistoryRepository.findBetHistoryById(betId);
    if (!row) {
      throw new NotFoundException('Bet not found');
    }
    return row;
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
