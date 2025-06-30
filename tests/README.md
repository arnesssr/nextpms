# Product System Tests

This folder contains all test scripts and diagnostic tools for the Product Management System.

## 📁 Test Files

### SQL Test Scripts (Run in Supabase SQL Editor)
- `supabase_products_complete_schema.sql` - Complete database schema update
- `check_category_relationships.sql` - Diagnostic script for category issues
- `fix_invalid_categories.sql` - Fix products with invalid category references
- `diagnostic_products.sql` - General product diagnostics
- `fix_products_rpc.sql` - Fix RPC function issues

### JavaScript Test Scripts (Run in Browser Console)
- `test_products_integration.js` - Complete integration test
- `test_category_fix.js` - Category display verification
- `test_product_actions.js` - Product action functionality test

## 🚀 How to Use Tests

### 1. Database Tests (SQL)
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the SQL scripts
4. Run them one by one

### 2. Frontend Tests (JavaScript)
1. Open your browser
2. Navigate to your product page
3. Open Developer Tools (F12)
4. Go to Console tab
5. Copy and paste the JavaScript code
6. Press Enter to run

## 📋 Test Checklist

### Database Health
- [ ] RPC function `get_products_with_categories` works
- [ ] Products have valid category relationships
- [ ] Category counts are accurate
- [ ] Product statuses are correct

### Frontend Functionality
- [ ] Products display with correct categories
- [ ] View Details action works
- [ ] Edit Product action works
- [ ] Duplicate action works
- [ ] Delete action works

### API Connectivity
- [ ] `/api/products` endpoint works
- [ ] `/api/products/[id]` endpoint works
- [ ] `/api/categories` endpoint works
- [ ] Product creation works
- [ ] Product updates work
- [ ] Product deletion works

## 🔧 Common Issues & Solutions

### "Uncategorized" showing instead of category name
**Solution**: Run `fix_invalid_categories.sql`

### 500 Error on products page
**Solution**: Run `supabase_products_complete_schema.sql`

### View Details not working
**Solution**: Check if product detail page exists at `/products/[id]/page.tsx`

### Actions not responding
**Solution**: Check browser console for JavaScript errors

## 📞 Quick Test Commands

### Test Categories in Console
```javascript
fetch('/api/products?limit=5')
  .then(r => r.json())
  .then(data => console.log(data.data.map(p => ({name: p.name, category: p.category_name}))))
```

### Test Individual Product
```javascript
fetch('/api/products/YOUR_PRODUCT_ID')
  .then(r => r.json())
  .then(data => console.log(data))
```

### Test Actions Availability
```javascript
console.log('Action buttons:', document.querySelectorAll('[data-radix-dropdown-menu-trigger]').length)
```
