-- Remove positions table and position_id columns
ALTER TABLE users DROP COLUMN IF EXISTS position_id;
ALTER TABLE documents DROP COLUMN IF EXISTS position_id;
DROP TABLE IF EXISTS positions;
