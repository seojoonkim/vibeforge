-- Add generated_image column to characters table
ALTER TABLE characters ADD COLUMN IF NOT EXISTS generated_image TEXT;
