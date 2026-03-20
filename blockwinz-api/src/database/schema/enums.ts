import { pgEnum } from 'drizzle-orm/pg-core';

export const adminRoleEnum = pgEnum('admin_role', [
  'super_admin',
  'admin',
  'moderator',
]);

export const userAccountEnum = pgEnum('user_account', ['user', 'admin']);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'settled',
  'failed',
  'cancelled',
]);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'deposit',
  'withdraw',
  'transfer',
  'debit',
  'credit',
  'credit_refund',
]);

export const currencyEnum = pgEnum('currency', ['sol', 'bwz']);
export const chainEnum = pgEnum('chain', ['solana']);

export const withdrawalStatusEnum = pgEnum('withdrawal_status', [
  'pending',
  'queued',
  'approved',
  'rejected',
  'completed',
  'failed',
]);

export const approvalTypeEnum = pgEnum('approval_type', [
  'manual',
  'automatic',
]);

export const seedStatusEnum = pgEnum('seed_status', [
  'active',
  'deactivated',
  'pending',
]);

export const dbGameSchemaEnum = pgEnum('db_game_schema', [
  'DiceGame',
  'LimboGame',
  'CoinFlipGame',
  'CrashGame',
  'KenoGame',
  'PlinkoGame',
  'RouletteGame',
  'MinesGame',
  'WheelGame',
  'TicTacToeGame',
]);

export const roomTypeEnum = pgEnum('room_type', ['chat', 'lobby']);

export const gameSessionStatusEnum = pgEnum('game_session_status', [
  'waiting',
  'active',
  'finished',
  'cancelled',
]);

export const referralStatusEnum = pgEnum('referral_status', [
  'pending',
  'completed',
  'expired',
  'cancelled',
]);

export const rewardTypeEnum = pgEnum('reward_type', [
  'BONUS_BALANCE',
  'TOKENS',
  'FREE_SPINS',
]);

export const requiredTaskEnum = pgEnum('required_task', [
  'DAILY_LOGIN',
  'PLAY_GAMES',
  'MINIMUM_DEPOSIT',
  'REFER_FRIEND',
]);
