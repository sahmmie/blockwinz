import { UserDto } from 'src/shared/dtos/user.dto';
import { Currency } from 'src/shared/enums/currencies.enum';
import { DbGameSchema } from 'src/shared/enums/dbSchema.enum';

export interface GameSession {
  _id: string;
  gameId: string;
  gameType: DbGameSchema;
  players: string[];
  betAmount: number;
  betAmountMustEqual: boolean;
  currency: Currency;
  status: GameSessionStatus;
  createdAt: Date;
  updatedAt: Date;
  invitedPlayers?: string[];
  invitedEmail?: string[];
}
export interface GameSessionWithPlayers extends Omit<GameSession, 'players'> {
  players: UserDto[];
}

export enum GameSessionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
