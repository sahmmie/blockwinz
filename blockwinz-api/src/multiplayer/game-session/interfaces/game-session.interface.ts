import { UserDto } from 'src/shared/dtos/user.dto';
import { Currency } from '@blockwinz/shared';
import { DbGameSchema } from '@blockwinz/shared';

export interface GameSession {
  _id: string;
  gameId: string;
  gameType: DbGameSchema;
  players: string[];
  betAmount: number;
  betAmountMustEqual: boolean;
  currency: Currency;
  status: MultiplayerSessionStatus;
  createdAt: Date;
  updatedAt: Date;
  invitedPlayers?: string[];
  invitedEmail?: string[];
}
export interface GameSessionWithPlayers extends Omit<GameSession, 'players'> {
  players: UserDto[];
}

/** Multiplayer session lifecycle (in-memory / gateway). */
export enum MultiplayerSessionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
