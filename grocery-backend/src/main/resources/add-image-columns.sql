-- Migration script to add image columns to category tables
-- Run this manually on Azure MySQL database OR include in application startup

-- Add image column to bakery table if it doesn't exist
ALTER TABLE bakery ADD COLUMN IF NOT EXISTS image TEXT;

-- Add image column to fruits table if it doesn't exist
ALTER TABLE fruits ADD COLUMN IF NOT EXISTS image TEXT;

-- Add image column to dairy table if it doesn't exist
ALTER TABLE dairy ADD COLUMN IF NOT EXISTS image TEXT;

-- Add image column to meat table if it doesn't exist
ALTER TABLE meat ADD COLUMN IF NOT EXISTS image TEXT;

-- Add image column to beverages table if it doesn't exist
ALTER TABLE beverages ADD COLUMN IF NOT EXISTS image TEXT;

-- Add image column to grains table if it doesn't exist
ALTER TABLE grains ADD COLUMN IF NOT EXISTS image TEXT;

-- Add image column to vegetables table if it doesn't exist
ALTER TABLE vegetables ADD COLUMN IF NOT EXISTS image TEXT;

-- Verify the changes
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('product', 'bakery', 'fruits', 'dairy', 'meat', 'beverages', 'grains', 'vegetables')
AND COLUMN_NAME = 'image'
ORDER BY TABLE_NAME;
