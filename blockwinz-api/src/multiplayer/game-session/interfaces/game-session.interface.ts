import { UserDto } from 'src/shared/dtos/user.dto';
import { Currency, DbGameSchema, MultiplayerSessionStatus } from '@blockwinz/shared';

export { MultiplayerSessionStatus };

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
