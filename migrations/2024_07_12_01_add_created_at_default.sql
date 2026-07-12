/* Migration: Ensure created_at has default now() and backfill nulls */

-- Set default value for created_at to current timestamp
ALTER TABLE produtos
  ALTER COLUMN created_at SET DEFAULT now();

-- Backfill existing rows where created_at is NULL
UPDATE produtos
  SET created_at = now()
  WHERE created_at IS NULL;
