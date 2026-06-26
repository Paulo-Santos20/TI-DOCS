ALTER TABLE documents ADD COLUMN IF NOT EXISTS image_url varchar(500);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS summary varchar(500);
