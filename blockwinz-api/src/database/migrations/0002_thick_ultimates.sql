ALTER TABLE "bet_histories" ADD COLUMN "usd_amount_requested" numeric(20, 8);--> statement-breakpoint
ALTER TABLE "bet_histories" ADD COLUMN "sol_usd_rate_at_bet" numeric(20, 8);