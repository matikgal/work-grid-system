-- Add contact fields for network store directory
ALTER TABLE stores ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS email TEXT;
