import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);
  private readonly balances: Map<string, number> = new Map();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async processPayout(winnerId: string, amount: number): Promise<void> {
    const current = this.balances.get(winnerId) || 0;
    this.balances.set(winnerId, current + amount);
    this.logger.log(`Payout completed for ${winnerId}: +${amount}`);
    this.eventEmitter.emit('payout.completed', { winnerId, amount });
  }

  getBalance(playerId: string): number {
    return this.balances.get(playerId) || 0;
  }
}
