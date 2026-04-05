ALTER TYPE "public"."db_game_schema" ADD VALUE 'QuoridorGame';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "multiplayer_quoridor_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"bet_result_status" text NOT NULL,
	"players" jsonb NOT NULL,
	"walls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"current_turn_user_id" text,
	"winner_id" uuid,
	"move_history" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "multiplayer_quoridor_session_id_idx" ON "multiplayer_quoridor_games" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "multiplayer_quoridor_bet_result_status_idx" ON "multiplayer_quoridor_games" USING btree ("bet_result_status");