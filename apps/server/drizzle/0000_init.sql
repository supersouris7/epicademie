CREATE TABLE "attempts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "attempts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"skill_id" text NOT NULL,
	"level" smallint NOT NULL,
	"seed" integer NOT NULL,
	"variant" boolean NOT NULL,
	"response" jsonb NOT NULL,
	"correct" boolean NOT NULL,
	"duration_ms" integer NOT NULL,
	"xp" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attempts_level_range" CHECK ("attempts"."level" between 1 and 3)
);
--> statement-breakpoint
CREATE TABLE "boss_records" (
	"profile_id" uuid NOT NULL,
	"chapter_id" text NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"best_hearts" smallint DEFAULT 0 NOT NULL,
	"best_medal" text DEFAULT 'bronze' NOT NULL,
	"first_won_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "boss_records_profile_id_chapter_id_pk" PRIMARY KEY("profile_id","chapter_id")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"profile_id" uuid NOT NULL,
	"item" text NOT NULL,
	"count" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "inventory_profile_id_item_pk" PRIMARY KEY("profile_id","item"),
	CONSTRAINT "inventory_count_range" CHECK ("inventory"."count" between 0 and 9)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"avatar" jsonb NOT NULL,
	"gender" text,
	"birth_date" date,
	"hero" text DEFAULT 'alex' NOT NULL,
	"grade" text,
	"xp" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"rubies" integer DEFAULT 2 NOT NULL,
	"sound_on" boolean DEFAULT true NOT NULL,
	"music_on" boolean DEFAULT true NOT NULL,
	"equipped" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_xp_nonnegative" CHECK ("profiles"."xp" >= 0),
	CONSTRAINT "profiles_coins_nonnegative" CHECK ("profiles"."coins" >= 0),
	CONSTRAINT "profiles_rubies_nonnegative" CHECK ("profiles"."rubies" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"mode" text NOT NULL,
	"subject" text NOT NULL,
	"chapter_id" text NOT NULL,
	"skill_id" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"answered" integer DEFAULT 0 NOT NULL,
	"correct" integer DEFAULT 0 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"confused" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"battle" jsonb
);
--> statement-breakpoint
CREATE TABLE "skill_states" (
	"profile_id" uuid NOT NULL,
	"skill_id" text NOT NULL,
	"stage" smallint DEFAULT 0 NOT NULL,
	"due" date,
	"attempts" integer DEFAULT 0 NOT NULL,
	"correct" integer DEFAULT 0 NOT NULL,
	"recent" jsonb NOT NULL,
	"maintained" integer DEFAULT 0 NOT NULL,
	"best_series" smallint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skill_states_profile_id_skill_id_pk" PRIMARY KEY("profile_id","skill_id"),
	CONSTRAINT "skill_states_stage_range" CHECK ("skill_states"."stage" between 0 and 3),
	CONSTRAINT "skill_states_best_range" CHECK ("skill_states"."best_series" between 0 and 5)
);
--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boss_records" ADD CONSTRAINT "boss_records_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_states" ADD CONSTRAINT "skill_states_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempts_session_idx" ON "attempts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "attempts_profile_skill_idx" ON "attempts" USING btree ("profile_id","skill_id");--> statement-breakpoint
CREATE INDEX "profiles_created_at_idx" ON "profiles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sessions_profile_mode_chapter_idx" ON "sessions" USING btree ("profile_id","mode","chapter_id");