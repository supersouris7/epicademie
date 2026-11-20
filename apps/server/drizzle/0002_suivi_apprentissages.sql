ALTER TABLE "attempts" ADD COLUMN "attempt" smallint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "hinted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "collective" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "skill_version" smallint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "diagnosis" text;--> statement-breakpoint
CREATE INDEX "attempts_profile_created_idx" ON "attempts" USING btree ("profile_id","created_at");--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_attempt_range" CHECK ("attempts"."attempt" between 1 and 2);