/* Migration: Add imagem_public_id column to produtos table */

ALTER TABLE produtos
  ADD COLUMN IF NOT EXISTS imagem_public_id text;
