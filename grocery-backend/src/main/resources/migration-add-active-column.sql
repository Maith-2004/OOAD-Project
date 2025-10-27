-- Migration script to add 'active' column to all product tables
-- Run this script on your Azure MySQL database to enable soft delete functionality

-- Add active column to product table
ALTER TABLE product 
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add active column to bakery table
ALTER TABLE bakery 
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add active column to fruits table
ALTER TABLE fruits 
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add active column to dairy table
ALTER TABLE dairy 
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add active column to meat table
ALTER TABLE meat 
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add active column to beverages table
ALTER TABLE beverages 
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add active column to grains table
ALTER TABLE grains 
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add active column to vegetables table
ALTER TABLE vegetables 
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Verify the changes
SELECT 'product' as table_name, COUNT(*) as total_rows, SUM(active) as active_rows FROM product
UNION ALL
SELECT 'bakery', COUNT(*), SUM(active) FROM bakery
UNION ALL
SELECT 'fruits', COUNT(*), SUM(active) FROM fruits
UNION ALL
SELECT 'dairy', COUNT(*), SUM(active) FROM dairy
UNION ALL
SELECT 'meat', COUNT(*), SUM(active) FROM meat
UNION ALL
SELECT 'beverages', COUNT(*), SUM(active) FROM beverages
UNION ALL
SELECT 'grains', COUNT(*), SUM(active) FROM grains
UNION ALL
SELECT 'vegetables', COUNT(*), SUM(active) FROM vegetables;
