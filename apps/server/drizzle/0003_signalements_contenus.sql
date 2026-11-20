CREATE TABLE "content_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "content_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"skill_id" text NOT NULL,
	"action" text NOT NULL,
	"version" smallint NOT NULL,
	"note" text,
	"account_id" uuid,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_states" (
	"skill_id" text PRIMARY KEY NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	"reviewed_version" smallint,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid,
	"profile_id" uuid,
	"skill_id" text NOT NULL,
	"level" smallint NOT NULL,
	"seed" integer NOT NULL,
	"skill_version" smallint NOT NULL,
	"reason" text NOT NULL,
	"comment" text,
	"status" text DEFAULT 'nouveau' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "question_reports_level_range" CHECK ("question_reports"."level" between 1 and 3)
);
--> statement-breakpoint
ALTER TABLE "content_events" ADD CONSTRAINT "content_events_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_events_skill_idx" ON "content_events" USING btree ("skill_id","at");--> statement-breakpoint
CREATE INDEX "question_reports_status_idx" ON "question_reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "question_reports_skill_idx" ON "question_reports" USING btree ("skill_id");