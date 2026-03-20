ALTER TABLE "bet_histories" ADD COLUMN "currency" text DEFAULT 'sol' NOT NULL;--> statement-breakpoint
ALTER TABLE "bet_histories" ADD COLUMN "multiplier" numeric(20, 8);