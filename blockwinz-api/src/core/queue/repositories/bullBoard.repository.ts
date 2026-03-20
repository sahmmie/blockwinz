import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import express from 'express';
import basicAuth from 'express-basic-auth';

@Injectable()
export class BullBoardRepository implements OnModuleInit {
  constructor(
    @InjectQueue('walletQueue') private readonly walletQueue: Queue,
    @InjectQueue('withdrawalQueue') private readonly withdrawalQueue: Queue,
  ) {}

  async onModuleInit() {
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

    const port = process.env.BULLBOARD_PORT;

    app.use(
      '/bull',
      basicAuth({
        users: { admin: 'admin' }, // Replace with your credentials
        challenge: true,
      }),
      serverAdapter.getRouter(),
    );

    app.listen(port, () =>
      console.log(`Bull board running on http://localhost:${port}/bull`),
    );
  }
}
