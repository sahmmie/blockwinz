ALTER TABLE "game_sessions" ADD COLUMN "visibility" text DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "host_user_id" uuid;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "max_players" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "join_code_hash" text;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "spectators_allowed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "spectator_user_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "turn_deadline_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "settled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "reconnect_grace_until" timestamp with time zone;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "game_sessions_visibility_status_idx" ON "game_sessions" USING btree ("visibility","game_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "game_sessions_game_type_status_idx" ON "game_sessions" USING btree ("game_type","game_status");
