import {
  AdminRole,
  ApprovalType,
  CHAIN,
  Currency,
  DbGameSchema,
  GameSessionStatus,
  ReferralStatus,
  RequiredTask,
  RewardType,
  RoomType,
  SeedStatus,
  TransactionStatus,
  TransactionType,
  UserAccountEnum,
  WithdrawalStatus,
} from '@blockwinz/shared';
import { pgEnum } from 'drizzle-orm/pg-core';
import { pgEnumValues } from './pg-enum-values';

export const adminRoleEnum = pgEnum('admin_role', pgEnumValues(AdminRole));

export const userAccountEnum = pgEnum(
  'user_account',
  pgEnumValues(UserAccountEnum),
);

export const transactionStatusEnum = pgEnum(
  'transaction_status',
  pgEnumValues(TransactionStatus),
);

export const transactionTypeEnum = pgEnum(
  'transaction_type',
  pgEnumValues(TransactionType),
);

export const currencyEnum = pgEnum('currency', pgEnumValues(Currency));
export const chainEnum = pgEnum('chain', pgEnumValues(CHAIN));

export const withdrawalStatusEnum = pgEnum(
  'withdrawal_status',
  pgEnumValues(WithdrawalStatus),
);

export const approvalTypeEnum = pgEnum(
  'approval_type',
  pgEnumValues(ApprovalType),
);

export const seedStatusEnum = pgEnum('seed_status', pgEnumValues(SeedStatus));

export const dbGameSchemaEnum = pgEnum(
  'db_game_schema',
  pgEnumValues(DbGameSchema),
);

export const roomTypeEnum = pgEnum('room_type', pgEnumValues(RoomType));

export const gameSessionStatusEnum = pgEnum(
  'game_session_status',
  pgEnumValues(GameSessionStatus),
);

export const referralStatusEnum = pgEnum(
  'referral_status',
  pgEnumValues(ReferralStatus),
);

export const rewardTypeEnum = pgEnum('reward_type', pgEnumValues(RewardType));

export const requiredTaskEnum = pgEnum(
  'required_task',
  pgEnumValues(RequiredTask),
);
