ALTER TABLE "documents" ADD COLUMN "content_type" varchar(20) DEFAULT 'rich-text' NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "content_url" varchar(500);
