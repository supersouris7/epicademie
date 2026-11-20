CREATE TABLE "hq_layouts" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"layout" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owned_cosmetics" (
	"profile_id" uuid NOT NULL,
	"cosmetic" text NOT NULL,
	"obtained_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "owned_cosmetics_profile_id_cosmetic_pk" PRIMARY KEY("profile_id","cosmetic")
);
--> statement-breakpoint
ALTER TABLE "hq_layouts" ADD CONSTRAINT "hq_layouts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owned_cosmetics" ADD CONSTRAINT "owned_cosmetics_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;