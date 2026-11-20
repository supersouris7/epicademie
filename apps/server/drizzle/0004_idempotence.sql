CREATE TABLE "idempotent_requests" (
	"family_id" uuid NOT NULL,
	"key" text NOT NULL,
	"route" text NOT NULL,
	"response" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "idempotent_requests_family_id_key_pk" PRIMARY KEY("family_id","key")
);
--> statement-breakpoint
ALTER TABLE "idempotent_requests" ADD CONSTRAINT "idempotent_requests_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idempotent_requests_created_idx" ON "idempotent_requests" USING btree ("created_at");