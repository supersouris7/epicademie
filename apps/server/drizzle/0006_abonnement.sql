CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"offer" text NOT NULL,
	"status" text DEFAULT 'en-attente' NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"period_end" date NOT NULL,
	"provider" text NOT NULL,
	"provider_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	CONSTRAINT "subscriptions_amount_positive" CHECK ("subscriptions"."amount_cents" > 0)
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscriptions_family_idx" ON "subscriptions" USING btree ("family_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_provider_ref_unique" ON "subscriptions" USING btree ("provider_ref");