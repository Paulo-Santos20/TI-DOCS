CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"sector_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_notif_user";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_notif_read";--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "content_type" varchar(20) DEFAULT 'rich-text' NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "content_url" varchar(500);--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "position_id" integer;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "position_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "positions" ADD CONSTRAINT "positions_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_positions_sector" ON "positions" USING btree ("sector_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_positions_name_sector" ON "positions" USING btree ("name","sector_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refresh_token" ON "refresh_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refresh_user" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_log_created" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_versions_document" ON "document_versions" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_documents_author" ON "documents" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_documents_reviewed_by" ON "documents" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_documents_editing_by" ON "documents" USING btree ("editing_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_documents_template_sector" ON "documents" USING btree ("template_for_sector_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notif_user_read" ON "notifications" USING btree ("user_id","read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_sector" ON "users" USING btree ("sector_id");