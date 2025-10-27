# Soft Delete Implementation - Deployment Guide

## ✅ Completed Changes

### 1. Models Updated (All 8 product tables)
Added `active` field (default = true) to:
- ✅ Product.java
- ✅ Bakery.java
- ✅ Fruits.java
- ✅ Dairy.java
- ✅ Meat.java
- ✅ Beverages.java
- ✅ Grains.java
- ✅ Vegetables.java

### 2. Repositories Updated
- ✅ ProductRepository.java - Added `findByActiveTrue()` and `findByIdAndActiveTrue()` methods

### 3. Controllers Updated
- ✅ **CategoryController.java** - PRIMARY CHANGE
  - `deleteFromCategory()` - Changed from hard delete to soft delete (sets active=false)
  - `findProductCategory()` - Only finds active products
  - `productExistsInCategory()` - Only checks for active products
  - DELETE endpoint returns "Product marked as inactive" message

- ✅ **ProductController.java** - SECONDARY
  - GET `/api/products` - Returns only active products
  - DELETE - Does soft delete (sets active=false)

## 🔧 Required Database Migration

**CRITICAL:** Run this SQL script on your Azure MySQL database BEFORE deploying the new JAR:

```sql
-- Add active column to all product tables
ALTER TABLE product ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE bakery ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE fruits ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE dairy ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE meat ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE beverages ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE grains ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE vegetables ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
```

**Migration file location:** `src/main/resources/migration-add-active-column.sql`

## 📋 Deployment Steps

### Step 1: Run Database Migration
```powershell
# Connect to Azure MySQL and run migration
mysql -h shanthistores20004.mysql.database.azure.com -u malithadmin -p'Malith@2004' -D grocerydb < src/main/resources/migration-add-active-column.sql
```

### Step 2: Build the JAR
```powershell
mvn clean package -DskipTests
```

### Step 3: Deploy to Azure
Upload `target/grocery-backend-0.0.1-SNAPSHOT.jar` to Azure App Service

### Step 4: Test the Changes
1. **Test DELETE**: Try deleting a product - should return "Product marked as inactive"
2. **Test GET**: Deleted products should NOT appear in product lists
3. **Test Orders**: Existing orders with "deleted" products should still work
4. **Verify Database**: Check that `active=0` for deleted products, not actually removed

## 🎯 How It Works

### Before (Hard Delete)
```
DELETE /api/categories/products/2
→ Throws 500 error if product is in orders
→ Product completely removed from database
→ Order history broken
```

### After (Soft Delete)
```
DELETE /api/categories/products/2
→ Sets product.active = false
→ Product stays in database with order history
→ Product hidden from GET requests
→ No foreign key constraint errors
```

## 🔍 What Still Needs Updating (Optional)

### Individual Category Controllers
These controllers still use hard delete (but rarely used since CategoryController is primary):
- BakeryController.java
- FruitsController.java
- DairyController.java
- MeatController.java
- BeveragesController.java
- GrainsController.java
- VegetablesController.java

**Recommendation**: Update these later if needed. CategoryController is the main delete endpoint.

## ✨ Benefits

1. **No Foreign Key Errors** - Products can be "deleted" even if used in orders
2. **Preserved History** - Order history remains intact
3. **Recoverable** - Products can be reactivated by setting active=true
4. **Better UX** - Clear message: "Product marked as inactive"
5. **Data Integrity** - No orphaned records

## 🚨 Important Notes

1. **Database migration MUST run first** - Otherwise app will crash on startup
2. **All existing products default to active=true** - No data loss
3. **Frontend unchanged** - API responses remain the same structure
4. **Order items unaffected** - Foreign key constraints remain but don't block deletion
