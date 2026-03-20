import { Injectable, Logger } from '@nestjs/common';

interface SuspiciousMatch {
  sessionId: string;
  playerA: string;
  playerB: string;
  ipA: string;
  ipB: string;
  deviceA?: string;
  deviceB?: string;
  timestamp: number;
  reason: string;
}

interface SuspiciousGameEvent {
  userId: string;
  type: string;
  gameId: string;
  reason: string;
  timestamp: number;
}

@Injectable()
export class AntiCheatService {
  private readonly logger = new Logger(AntiCheatService.name);
  private readonly suspiciousMatches: SuspiciousMatch[] = [];
  private readonly suspiciousGameEvents: SuspiciousGameEvent[] = [];
  private readonly recentMatchups: Map<string, number[]> = new Map(); // key: playerA|playerB, value: timestamps

  logSuspiciousMatch(match: SuspiciousMatch) {
    this.suspiciousMatches.push(match);
    this.logger.warn(`Suspicious match detected: ${match.reason}`);
  }

  logSuspiciousGameEvent(event: SuspiciousGameEvent) {
    this.suspiciousGameEvents.push(event);
    this.logger.warn(`Suspicious game event: ${event.reason}`);
  }

  getSuspiciousMatches() {
    return this.suspiciousMatches;
  }

  getSuspiciousGameEvents() {
    return this.suspiciousGameEvents;
  }
}
