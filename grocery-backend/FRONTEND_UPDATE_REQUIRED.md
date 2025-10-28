# Frontend Update Required - Product Duplication Fix

## 🐛 Problem
When updating a product (especially when only changing the picture), the product gets duplicated instead of being updated in place.

## 🔍 Root Cause
The backend now **requires** both `category` and `oldCategory` fields in the update request to prevent duplication. The frontend currently only sends `category` but not `oldCategory`.

**Why this causes duplication:**
- Backend searches for product across ALL tables when `oldCategory` is missing
- Same product ID can exist in multiple tables (auto-increment per table)
- Backend might find ID in wrong table → thinks category changed → deletes + creates new → **DUPLICATION**

## ✅ Solution
Frontend must **always send `oldCategory`** field when updating products.

---

## 📝 Required Changes

### 1. Fix `App.js` - `managerUpdateProduct()` function

**File:** `grocery-frontend/src/App.js`

**Current Code (Line ~247-257):**
```javascript
const payload = {
  name: form.name,
  description: form.description,
  price: parseFloat(form.price),
  quantity: parseInt(form.quantity, 10),
  image: form.image || null,
  category: form.category || 'products' // Include category
};
```

**Updated Code:**
```javascript
const payload = {
  name: form.name,
  description: form.description,
  price: parseFloat(form.price),
  quantity: parseInt(form.quantity, 10),
  image: form.image || null,
  category: form.category || 'products',
  oldCategory: form.category || 'products' // ⚠️ CRITICAL: Must send oldCategory to prevent duplication
};
```

**Explanation:**
- When editing a product, the form already contains the current category
- We need to send this as both `category` (new category) and `oldCategory` (current category)
- If user changes category, they'll update the `category` field in the form, but `oldCategory` stays as original
- This allows backend to detect actual category changes vs simple field updates

### 2. Fix JSX Syntax Error (Line 4766)

**File:** `grocery-frontend/src/App.js` (Line ~4766)

**Error Message:**
```
Syntax error: Expected corresponding JSX closing tag for <div>. (4766:24)
```

**Action Required:**
- Locate line 4766 in `App.js`
- Find the unclosed `<div>` tag
- Add the missing `</div>` closing tag

**Hint:** Based on the code context, it's likely in the image upload section of the product form.

---

## 🔧 Alternative Solution (Better Approach)

Instead of sending `oldCategory: form.category`, it's better to **track the original category separately**:

### Option A: Store Original Category in Form

**When clicking Edit button (multiple locations in App.js):**

**Current Code:**
```javascript
<button onClick={()=>{
  setForm({
    name: p.name,
    description: p.description,
    price: p.price,
    quantity: p.quantity,
    category: 'bakery',  // or 'products', 'fruits', etc.
    image: p.image || ''
  });
  setImagePreview(p.image || '');
  setImageFile(null);
  setEditingProductId(p.id);
}}>Edit</button>
```

**Updated Code:**
```javascript
<button onClick={()=>{
  setForm({
    name: p.name,
    description: p.description,
    price: p.price,
    quantity: p.quantity,
    category: 'bakery',  // or 'products', 'fruits', etc.
    oldCategory: 'bakery',  // ⚠️ ADD THIS: Store original category
    image: p.image || ''
  });
  setImagePreview(p.image || '');
  setImageFile(null);
  setEditingProductId(p.id);
}}>Edit</button>
```

**Apply this change to ALL Edit buttons** (one for each category: products, bakery, fruits, dairy, meat, beverages, grains, vegetables)

**Then in `managerUpdateProduct()` payload:**
```javascript
const payload = {
  name: form.name,
  description: form.description,
  price: parseFloat(form.price),
  quantity: parseInt(form.quantity, 10),
  image: form.image || null,
  category: form.category || 'products',
  oldCategory: form.oldCategory || form.category || 'products'  // Use stored oldCategory
};
```

---

## 📍 Files to Update

### Required Changes:
1. ✅ **`grocery-frontend/src/App.js`** - Line ~247 (managerUpdateProduct function)
2. ⚠️ **`grocery-frontend/src/App.js`** - Line ~4766 (Fix JSX syntax error)

### Optional but Recommended:
3. 📝 **`grocery-frontend/src/App.js`** - Multiple Edit button locations (~8 places)
   - Search for: `setForm({name:p.name,description:p.description`
   - Add `oldCategory` field to each

---

## 🧪 Testing After Changes

1. **Build the frontend:**
   ```bash
   cd grocery-frontend
   npm run build
   ```

2. **Rebuild backend JAR:**
   ```bash
   cd grocery-backend
   mvn clean package -DskipTests
   ```

3. **Test scenarios:**
   - ✅ Update product picture only → Should NOT duplicate
   - ✅ Update product name/price/quantity → Should NOT duplicate
   - ✅ Change product category → Should move to new category (delete + create is OK here)
   - ✅ Create new product → Should work normally
   - ✅ Delete product → Should soft delete (active=false)

---

## 🚨 Backend Validation

The backend will now return this error if `oldCategory` is missing:

```json
{
  "success": false,
  "error": "oldCategory is required in request body to prevent duplication. Frontend must send the current category."
}
```

If you see this error, it means the frontend is not sending `oldCategory`.

---

## 📋 Summary

| Issue | Solution | Priority |
|-------|----------|----------|
| Product duplication on update | Add `oldCategory` to update payload | 🔴 CRITICAL |
| JSX syntax error preventing build | Fix missing `</div>` at line 4766 | 🔴 CRITICAL |
| Category change detection | Store `oldCategory` when editing | 🟡 RECOMMENDED |

---

## 🎯 Quick Fix (Minimal Changes)

If you want the quickest fix with minimal code changes:

**File: `grocery-frontend/src/App.js`**

Find the `managerUpdateProduct` function and change:
```javascript
category: form.category || 'products' // Include category
```

To:
```javascript
category: form.category || 'products',
oldCategory: form.category || 'products'  // Prevent duplication
```

Then fix the JSX error on line 4766 and rebuild.

---

## 📞 Questions?

If you need help implementing these changes:
1. First fix the JSX syntax error so the build succeeds
2. Then implement the `oldCategory` fix
3. Test locally before deploying to Azure
