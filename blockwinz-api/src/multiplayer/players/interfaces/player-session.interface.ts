export interface PlayerSessionState {
  playerId: string;
  sessionId: string;
  connected: boolean;
  lastActive: number; // timestamp (ms)
  disconnectedAt?: number;
}
