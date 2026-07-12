/*
  Migration: Set default value for created_at and backfill missing timestamps
  This script assumes you are using PostgreSQL with Supabase.
*/

-- Set default to current timestamp for future inserts
ALTER TABLE produtos
  ALTER COLUMN created_at SET DEFAULT now();

-- Backfill existing rows that have NULL created_at
UPDATE produtos
  SET created_at = now()
  WHERE created_at IS NULL;

-- (Optional) Make the column NOT NULL if you want to enforce it
-- ALTER TABLE produtos ALTER COLUMN created_at SET NOT NULL;
