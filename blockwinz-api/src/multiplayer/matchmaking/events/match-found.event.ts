import { MatchRequest } from '../match-request.interface';

export class MatchFoundEvent {
  constructor(
    public readonly player1: MatchRequest,
    public readonly player2: MatchRequest,
    public readonly sessionId: string,
    public readonly foundAt: Date = new Date(),
  ) {}
}
