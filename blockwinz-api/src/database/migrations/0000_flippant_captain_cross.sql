CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'admin', 'moderator');--> statement-breakpoint
CREATE TYPE "public"."approval_type" AS ENUM('manual', 'automatic');--> statement-breakpoint
CREATE TYPE "public"."chain" AS ENUM('solana');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('sol', 'bwz');--> statement-breakpoint
CREATE TYPE "public"."db_game_schema" AS ENUM('DiceGame', 'LimboGame', 'CoinFlipGame', 'CrashGame', 'KenoGame', 'PlinkoGame', 'RouletteGame', 'MinesGame', 'WheelGame', 'TicTacToeGame');--> statement-breakpoint
CREATE TYPE "public"."game_session_status" AS ENUM('waiting', 'active', 'finished', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('pending', 'completed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."required_task" AS ENUM('DAILY_LOGIN', 'PLAY_GAMES', 'MINIMUM_DEPOSIT', 'REFER_FRIEND');--> statement-breakpoint
CREATE TYPE "public"."reward_type" AS ENUM('BONUS_BALANCE', 'TOKENS', 'FREE_SPINS');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('chat', 'lobby');--> statement-breakpoint
CREATE TYPE "public"."seed_status" AS ENUM('active', 'deactivated', 'pending');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'settled', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('deposit', 'withdraw', 'transfer', 'debit', 'credit', 'credit_refund');--> statement-breakpoint
CREATE TYPE "public"."user_account" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_status" AS ENUM('pending', 'queued', 'approved', 'rejected', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"last_logout" timestamp with time zone,
	"last_login" timestamp with time zone,
	"password" text NOT NULL,
	"profile_id" uuid NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"fa_enabled" boolean DEFAULT false NOT NULL,
	"nonce" integer DEFAULT 0 NOT NULL,
	"future_client_seed" text,
	"future_server_seed" text,
	"future_server_seed_hash" text,
	"active_seed_id" uuid,
	"user_accounts" text[] DEFAULT '{"user"}' NOT NULL,
	"email_verification_token" text,
	"email_verification_token_expires" timestamp with time zone,
	"email_verification_resend_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_verification_token_unique" UNIQUE("email_verification_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"is_hot_keys_active" boolean DEFAULT false NOT NULL,
	"can_withdraw" boolean DEFAULT false NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"is_turbo" boolean DEFAULT false NOT NULL,
	"referral_code" text,
	"referred_by" text,
	"referral_count" integer DEFAULT 0 NOT NULL,
	"referral_earnings" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"last_logout" timestamp with time zone,
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"last_login" timestamp with time zone,
	"last_login_ip" text,
	"created_by" text,
	"updated_by" text,
	"two_factor_enabled" boolean DEFAULT false,
	"two_factor_secret" text,
	"failed_login_attempts" integer DEFAULT 0,
	"lock_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"otp" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_used" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waitlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"is_active" boolean DEFAULT false,
	"joined_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"address" text NOT NULL,
	"private_key" text NOT NULL,
	"public_key" text NOT NULL,
	"is_valid" boolean DEFAULT true NOT NULL,
	"currency" text NOT NULL,
	"chain" text NOT NULL,
	"on_chain_balance" numeric(20, 8) DEFAULT '0' NOT NULL,
	"app_balance" numeric(20, 8) DEFAULT '0' NOT NULL,
	"pending_withdrawal" numeric(20, 8) DEFAULT '0' NOT NULL,
	"locked_in_bets" numeric(20, 8) DEFAULT '0' NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"fulfillment_date" timestamp with time zone,
	"transaction_amount" numeric(20, 8) NOT NULL,
	"game_id" uuid,
	"game_model" text,
	"txid" text,
	"metadata" jsonb,
	"on_chain" boolean DEFAULT false,
	"chain" text,
	"currency" text,
	"withdrawal_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"currency" text NOT NULL,
	"destination_address" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by_id" uuid,
	"approved_at" timestamp with time zone,
	"rejected_by_id" uuid,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"request_id" text NOT NULL,
	"processed_at" timestamp with time zone,
	"transaction_hash" text,
	"approval_type" text DEFAULT 'manual',
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "withdrawals_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seeds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" text NOT NULL,
	"client_seed" text NOT NULL,
	"server_seed" text NOT NULL,
	"server_seed_hash" text NOT NULL,
	"deactivated_at" timestamp with time zone,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bet_histories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"game_type" text NOT NULL,
	"bet_amount" numeric(20, 8) NOT NULL,
	"total_win_amount" numeric(20, 8),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer" text NOT NULL,
	"referred" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reward_amount" numeric(20, 8) DEFAULT '0' NOT NULL,
	"conditions" jsonb NOT NULL,
	"progress" jsonb NOT NULL,
	"history" jsonb NOT NULL,
	"completed_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referral_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"minimum_deposit_amount" integer DEFAULT 100 NOT NULL,
	"reward_percentage" integer DEFAULT 10 NOT NULL,
	"max_referrals_per_user" integer DEFAULT 10 NOT NULL,
	"referral_completion_timeframe" integer DEFAULT 30 NOT NULL,
	"referral_code_prefix" text DEFAULT 'BWZ' NOT NULL,
	"referral_code_length" integer DEFAULT 8 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"reward_amount" numeric(20, 8) NOT NULL,
	"reward_type" text NOT NULL,
	"expiry_date" timestamp with time zone NOT NULL,
	"max_redemptions" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"required_tasks" text[] DEFAULT '{}',
	"minimum_deposit_amount" numeric(20, 8) DEFAULT '0',
	"min_games_played" integer DEFAULT 0,
	"claim_delay_in_hours" integer DEFAULT 0,
	"login_streak_required" integer DEFAULT 0,
	"custom_condition_fn_name" text,
	"redeemed_by" text[] DEFAULT '{}',
	"current_redemptions" integer DEFAULT 0,
	"description" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_private" boolean DEFAULT false,
	"created_by_id" uuid,
	"room_type" text DEFAULT 'chat' NOT NULL,
	"members" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"username" text NOT NULL,
	"room_id" uuid NOT NULL,
	"room_name" text NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "favourites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"games" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_free_bwz" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"send_history" jsonb DEFAULT '[]'::jsonb,
	"total_sent" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_free_bwz_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"game_id" uuid,
	"game_type" text NOT NULL,
	"players" uuid[] DEFAULT '{}' NOT NULL,
	"bet_amount" numeric(20, 8) NOT NULL,
	"bet_amount_must_equal" boolean DEFAULT false,
	"currency" text NOT NULL,
	"game_status" text NOT NULL,
	"invited_players" uuid[] DEFAULT '{}',
	"invited_email" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dice_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"seed_id" uuid NOT NULL,
	"bet_amount" numeric(20, 8) NOT NULL,
	"total_win_amount" numeric(20, 8),
	"currency" text NOT NULL,
	"multiplier" numeric(20, 8) NOT NULL,
	"nonce" integer NOT NULL,
	"stop_on_profit" numeric(20, 8),
	"stop_on_loss" numeric(20, 8),
	"increase_by" numeric(20, 8),
	"decrease_by" numeric(20, 8),
	"is_manual_mode" boolean DEFAULT false,
	"is_turbo_mode" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"roll_over_bet" numeric(20, 8) NOT NULL,
	"bet_result_float" numeric(20, 8) NOT NULL,
	"bet_result_status" text NOT NULL,
	"direction" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "limbo_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"seed_id" uuid NOT NULL,
	"bet_amount" numeric(20, 8) NOT NULL,
	"total_win_amount" numeric(20, 8),
	"currency" text NOT NULL,
	"multiplier" numeric(20, 8) NOT NULL,
	"nonce" integer NOT NULL,
	"stop_on_profit" numeric(20, 8),
	"stop_on_loss" numeric(20, 8),
	"increase_by" numeric(20, 8),
	"decrease_by" numeric(20, 8),
	"is_manual_mode" boolean DEFAULT false,
	"is_turbo_mode" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"bet_result_number" numeric(20, 8),
	"bet_result_status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coinflip_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"seed_id" uuid NOT NULL,
	"bet_amount" numeric(20, 8) NOT NULL,
	"total_win_amount" numeric(20, 8),
	"currency" text NOT NULL,
	"multiplier" numeric(20, 8) NOT NULL,
	"nonce" integer NOT NULL,
	"stop_on_profit" numeric(20, 8),
	"stop_on_loss" numeric(20, 8),
	"increase_by" numeric(20, 8),
	"decrease_by" numeric(20, 8),
	"is_manual_mode" boolean DEFAULT false,
	"is_turbo_mode" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"risk" text NOT NULL,
	"coins" integer NOT NULL,
	"side" integer NOT NULL,
	"min" integer NOT NULL,
	"results" integer[] NOT NULL,
	"bet_result_status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mines_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"seed_id" uuid NOT NULL,
	"bet_amount" numeric(20, 8) NOT NULL,
	"total_win_amount" numeric(20, 8),
	"currency" text NOT NULL,
	"multiplier" numeric(20, 8) NOT NULL,
	"nonce" integer NOT NULL,
	"stop_on_profit" numeric(20, 8),
	"stop_on_loss" numeric(20, 8),
	"increase_by" numeric(20, 8),
	"decrease_by" numeric(20, 8),
	"is_manual_mode" boolean DEFAULT false,
	"is_turbo_mode" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"bet_result_status" text NOT NULL,
	"mines_count" integer NOT NULL,
	"selected" integer[] NOT NULL,
	"mines_result" integer[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plinko_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"seed_id" uuid NOT NULL,
	"bet_amount" numeric(20, 8) NOT NULL,
	"total_win_amount" numeric(20, 8),
	"currency" text NOT NULL,
	"multiplier" numeric(20, 8) NOT NULL,
	"nonce" integer NOT NULL,
	"stop_on_profit" numeric(20, 8),
	"stop_on_loss" numeric(20, 8),
	"increase_by" numeric(20, 8),
	"decrease_by" numeric(20, 8),
	"is_manual_mode" boolean DEFAULT false,
	"is_turbo_mode" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"rows" integer NOT NULL,
	"risk" text NOT NULL,
	"results" integer[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "keno_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"seed_id" uuid NOT NULL,
	"bet_amount" numeric(20, 8) NOT NULL,
	"total_win_amount" numeric(20, 8),
	"currency" text NOT NULL,
	"multiplier" numeric(20, 8) NOT NULL,
	"nonce" integer NOT NULL,
	"stop_on_profit" numeric(20, 8),
	"stop_on_loss" numeric(20, 8),
	"increase_by" numeric(20, 8),
	"decrease_by" numeric(20, 8),
	"is_manual_mode" boolean DEFAULT false,
	"is_turbo_mode" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"selected_numbers" integer[] NOT NULL,
	"result_numbers" integer[] NOT NULL,
	"risk" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wheel_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"seed_id" uuid NOT NULL,
	"bet_amount" numeric(20, 8) NOT NULL,
	"total_win_amount" numeric(20, 8),
	"currency" text NOT NULL,
	"multiplier" numeric(20, 8) NOT NULL,
	"nonce" integer NOT NULL,
	"stop_on_profit" numeric(20, 8),
	"stop_on_loss" numeric(20, 8),
	"increase_by" numeric(20, 8),
	"decrease_by" numeric(20, 8),
	"is_manual_mode" boolean DEFAULT false,
	"is_turbo_mode" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"risk" text NOT NULL,
	"segments" integer NOT NULL,
	"bet_result_status" text,
	"bet_result_number" numeric(20, 8)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tictactoe_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"seed_id" uuid NOT NULL,
	"bet_amount" numeric(20, 8) NOT NULL,
	"total_win_amount" numeric(20, 8),
	"currency" text NOT NULL,
	"multiplier" numeric(20, 8) NOT NULL,
	"nonce" integer NOT NULL,
	"stop_on_profit" numeric(20, 8),
	"stop_on_loss" numeric(20, 8),
	"increase_by" numeric(20, 8),
	"decrease_by" numeric(20, 8),
	"is_manual_mode" boolean DEFAULT false,
	"is_turbo_mode" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"board" jsonb,
	"bet_result_status" text NOT NULL,
	"user_is" text DEFAULT 'O' NOT NULL,
	"ai_is" text DEFAULT 'X' NOT NULL,
	"current_turn" text,
	"risk" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "multiplayer_tictactoe_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board" jsonb NOT NULL,
	"bet_result_status" text NOT NULL,
	"players" jsonb NOT NULL,
	"current_turn" text,
	"winner" text,
	"winner_id" uuid,
	"move_history" jsonb DEFAULT '[]'::jsonb,
	"session_id" uuid NOT NULL,
	"afk_players" uuid[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_user_id_idx" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_referral_code_idx" ON "profiles" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_referred_by_idx" ON "profiles" USING btree ("referred_by");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_idx" ON "admins" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "waitlists_email_idx" ON "waitlists" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wallets_user_id_idx" ON "wallets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wallets_currency_idx" ON "wallets" USING btree ("currency");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wallets_chain_idx" ON "wallets" USING btree ("chain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transactions_game_id_idx" ON "transactions" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transactions_type_idx" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "withdrawals_request_id_idx" ON "withdrawals" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "withdrawals_user_id_idx" ON "withdrawals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "withdrawals_status_idx" ON "withdrawals" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "seeds_user_id_idx" ON "seeds" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bet_histories_user_id_created_at_idx" ON "bet_histories" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referrals_referrer_idx" ON "referrals" USING btree ("referrer");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referrals_referred_idx" ON "referrals" USING btree ("referred");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referrals_expires_at_idx" ON "referrals" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupons_expiry_date_idx" ON "coupons" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupons_is_active_idx" ON "coupons" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rooms_name_idx" ON "rooms" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rooms_room_type_idx" ON "rooms" USING btree ("room_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_room_name_idx" ON "messages" USING btree ("room_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "favourites_user_id_idx" ON "favourites" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "credit_free_bwz_username_idx" ON "credit_free_bwz" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "game_sessions_game_id_idx" ON "game_sessions" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "game_sessions_players_idx" ON "game_sessions" USING btree ("players");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "game_sessions_game_status_idx" ON "game_sessions" USING btree ("game_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dice_games_user_id_idx" ON "dice_games" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dice_games_created_at_idx" ON "dice_games" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dice_games_seed_id_idx" ON "dice_games" USING btree ("seed_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "limbo_games_user_id_idx" ON "limbo_games" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "limbo_games_created_at_idx" ON "limbo_games" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "limbo_games_seed_id_idx" ON "limbo_games" USING btree ("seed_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coinflip_games_user_id_idx" ON "coinflip_games" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coinflip_games_created_at_idx" ON "coinflip_games" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coinflip_games_seed_id_idx" ON "coinflip_games" USING btree ("seed_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mines_games_user_id_idx" ON "mines_games" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mines_games_created_at_idx" ON "mines_games" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mines_games_seed_id_idx" ON "mines_games" USING btree ("seed_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mines_games_user_id_bet_status_idx" ON "mines_games" USING btree ("user_id","bet_result_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plinko_games_user_id_idx" ON "plinko_games" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plinko_games_created_at_idx" ON "plinko_games" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plinko_games_seed_id_idx" ON "plinko_games" USING btree ("seed_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "keno_games_user_id_idx" ON "keno_games" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "keno_games_created_at_idx" ON "keno_games" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "keno_games_seed_id_idx" ON "keno_games" USING btree ("seed_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wheel_games_user_id_idx" ON "wheel_games" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wheel_games_created_at_idx" ON "wheel_games" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wheel_games_seed_id_idx" ON "wheel_games" USING btree ("seed_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tictactoe_games_user_id_idx" ON "tictactoe_games" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tictactoe_games_created_at_idx" ON "tictactoe_games" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "multiplayer_tictactoe_session_id_idx" ON "multiplayer_tictactoe_games" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "multiplayer_tictactoe_bet_result_status_idx" ON "multiplayer_tictactoe_games" USING btree ("bet_result_status");