import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import express from 'express';
import basicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BullBoardRepository implements OnModuleInit {
  private readonly logger = new Logger(BullBoardRepository.name);

  constructor(
    @InjectQueue('walletQueue') private readonly walletQueue: Queue,
    @InjectQueue('withdrawalQueue') private readonly withdrawalQueue: Queue,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    if (this.config.get<string>('ENABLE_BULL_BOARD') !== 'true') {
      return;
    }

    const username = this.config.get<string>('BULL_BOARD_USERNAME')?.trim();
    const password = this.config.get<string>('BULL_BOARD_PASSWORD')?.trim();
    const port = this.config.get<string>('BULLBOARD_PORT')?.trim();

    if (!username || !password || !port) {
      this.logger.warn(
        'Bull Board is enabled but missing BULL_BOARD_USERNAME/BULL_BOARD_PASSWORD/BULLBOARD_PORT',
      );
      return;
    }

    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/bull');

    createBullBoard({
      queues: [
        new BullAdapter(this.walletQueue),
        new BullAdapter(this.withdrawalQueue),
      ],
      serverAdapter,
    });

    const app = express();

    app.use(
      '/bull',
      basicAuth({
        users: { [username]: password },
        challenge: true,
      }),
      serverAdapter.getRouter(),
    );

    app.listen(port, () =>
      this.logger.log(`Bull board running on http://localhost:${port}/bull`),
    );
  }
}
