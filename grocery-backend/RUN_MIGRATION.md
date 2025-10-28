# How to Run the Database Migration

## Problem
The `active` column doesn't exist in your database yet, so soft delete isn't working. Products say "deleted" but don't actually hide because the column doesn't exist.

## Solution - Run Migration on Azure

### Option 1: Azure Portal MySQL Workbench (EASIEST)

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to your MySQL database: `shanthistores20004`
3. Click **"Query editor"** or **"Workbench"** in the left menu
4. Copy and paste this SQL:

```sql
-- Add active column to all product tables
ALTER TABLE product ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE bakery ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE fruits ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE dairy ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE meat ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE beverages ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE grains ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE vegetables ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;

-- Verify the changes
SELECT 'product' as table_name, COUNT(*) as total_rows FROM product
UNION ALL
SELECT 'bakery', COUNT(*) FROM bakery
UNION ALL
SELECT 'fruits', COUNT(*) FROM fruits
UNION ALL
SELECT 'dairy', COUNT(*) FROM dairy
UNION ALL
SELECT 'meat', COUNT(*) FROM meat
UNION ALL
SELECT 'beverages', COUNT(*) FROM beverages
UNION ALL
SELECT 'grains', COUNT(*) FROM grains
UNION ALL
SELECT 'vegetables', COUNT(*) FROM vegetables;
```

5. Click **"Run"** or **"Execute"**
6. You should see "Query succeeded" and the verification results

### Option 2: MySQL Workbench (Desktop App)

1. Download MySQL Workbench: https://dev.mysql.com/downloads/workbench/
2. Create new connection:
   - Hostname: `shanthistores20004.mysql.database.azure.com`
   - Port: `3306`
   - Username: `malithadmin`
   - Password: `Malith@2004`
   - Database: `grocerydb`
3. Connect
4. Click **"File" → "Open SQL Script"**
5. Navigate to: `src\main\resources\migration-add-active-column.sql`
6. Click **Execute** (lightning bolt icon)

### Option 3: Azure Cloud Shell

1. Go to Azure Portal
2. Click Cloud Shell icon (>_) at the top
3. Run:
```bash
mysql -h shanthistores20004.mysql.database.azure.com -u malithadmin -p -D grocerydb
```
4. Enter password: `Malith@2004`
5. Paste the SQL commands from above
6. Type `exit` when done

### Option 4: Fix Firewall and Use Local MySQL CLI

The connection timeout error (10060) means Azure MySQL firewall is blocking your IP.

1. Go to Azure Portal → Your MySQL Server → **"Networking"** or **"Connection Security"**
2. Click **"Add client IP"** or **"Add current client IP address"**
3. Save changes
4. Wait 1-2 minutes for firewall to update
5. Try the command again:
```powershell
mysql -h shanthistores20004.mysql.database.azure.com -u malithadmin -p"Malith@2004" -D grocerydb < src\main\resources\migration-add-active-column.sql
```

## Verification

After running migration, connect and check:
```sql
SHOW COLUMNS FROM product;
```

You should see the `active` column with type `tinyint(1)` and Default `1`.

## After Migration

1. **Redeploy** your JAR to Azure
2. **Test delete** - Products should now actually disappear from the UI
3. **Check database** - Deleted products will have `active=0` but still exist in the table

## Troubleshooting

### "Column already exists" error
This is OK! It means the column was already added. Skip to verification.

### "Access denied" error
Check your password is correct: `Malith@2004`

### "Can't connect" error (10060)
Add your IP to Azure MySQL firewall (see Option 4 above)

### Products still showing after delete
1. Check if migration ran successfully
2. Clear browser cache
3. Check browser console for errors
4. Verify the new JAR is deployed
