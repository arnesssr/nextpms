# Module Definition Rules

## 🏷️ What Is a Module?

A **module** is a self-contained unit of functionality that represents either:
1. **A business domain** (Main Module)
2. **A functional area within a domain** (Submodule)

## 📏 Module Qualification Criteria

### ✅ REQUIRED for Module Status

For something to qualify as a **MODULE**, it **MUST** have:

```
module-name/
├── 📁 components/          ← UI components specific to this module
├── 📁 hooks/               ← Custom React hooks for this module
├── 📁 types/               ← TypeScript type definitions
└── 📄 page.tsx             ← Main page component (if routable)
```

### ❌ NOT a Module

These do **NOT** qualify as modules:

❌ **Single file directories**
```
❌ bad-example/
   └── page.tsx             ← Only one file
```

❌ **Missing required folders**
```
❌ incomplete-module/
   ├── components/          ← Has this
   └── page.tsx             ← Missing hooks/ and types/
```

❌ **Random collections of files**
```
❌ messy-folder/
   ├── randomFile.tsx
   ├── anotherFile.js
   └── someUtils.ts
```

## 🎯 Module Types

### 1. Main Modules (Level 1)
**Business domain containers**

**Location**: `src/app/{domain}/`

**Examples**:
- `products/` - Product management domain
- `categories/` - Category management domain
- `orders/` - Order processing domain
- `users/` - User management domain

**Structure**:
```
products/                   ← Main Module
├── page.tsx                ← Domain dashboard
├── components/             ← Global domain components
└── product-modules/        ← Submodules container
    ├── product-catalog/    ← Submodule
    ├── inventory-mgmt/     ← Submodule
    └── pricing-mgmt/       ← Submodule
```

### 2. Submodules (Level 2)
**Functional areas within a domain**

**Location**: `src/app/{domain}/{domain}-modules/{feature}/`

**Examples**:
- `product-catalog/` - Browse and view products
- `product-inventory/` - Stock management  
- `product-pricing/` - Price management
- `category-management/` - CRUD operations
- `category-tree/` - Hierarchical view

**Structure**:
```
product-catalog/            ← Submodule
├── components/             ← Feature-specific components
│   ├── ProductCatalogList.tsx
│   ├── ProductDetailModal.tsx
│   └── index.ts
├── hooks/                  ← Feature-specific hooks
│   ├── useProductCatalog.ts
│   └── index.ts
├── types/                  ← Feature-specific types
│   └── index.ts
└── page.tsx                ← Feature page (optional)
```

## 🔍 Module Validation Checklist

Use this checklist to validate if something qualifies as a module:

### ✅ Structure Validation
- [ ] Has `components/` folder with at least one component
- [ ] Has `hooks/` folder (can be empty initially)
- [ ] Has `types/` folder with type definitions
- [ ] Has `index.ts` files in each folder for clean exports
- [ ] Has `page.tsx` if the module is routable

### ✅ Content Validation
- [ ] Components are related to the module's purpose
- [ ] Hooks are specific to the module's functionality
- [ ] Types define the module's data structures
- [ ] No unrelated functionality mixed in

### ✅ Naming Validation
- [ ] Module name clearly describes its purpose
- [ ] Follows kebab-case naming convention
- [ ] Submodules are prefixed with domain name (e.g., `product-catalog`)

## 🚫 Anti-Patterns (What NOT to Do)

### ❌ Fake Modules
```
❌ single-file-module/
   └── page.tsx             ← This is NOT a module!
```
**Fix**: Move single files to appropriate existing modules or create proper module structure.

### ❌ Mixed Concerns
```
❌ confusing-module/
   ├── components/
   │   ├── ProductCard.tsx   ← Product-related
   │   └── UserProfile.tsx   ← User-related (WRONG!)
   └── hooks/
```
**Fix**: Separate concerns into appropriate domain modules.

### ❌ Empty Modules
```
❌ empty-module/
   ├── components/          ← Empty
   ├── hooks/               ← Empty  
   └── types/               ← Empty
```
**Fix**: Don't create modules until you have real functionality to put in them.

## 📋 Module Creation Process

1. **Identify the domain** - Which main module does this belong to?
2. **Define the purpose** - What specific functionality will this module handle?
3. **Check if it qualifies** - Does it meet the criteria for being a module?
4. **Create structure** - Set up all required folders
5. **Add initial content** - Create basic components, hooks, and types
6. **Document the module** - Add README and update architecture docs

## 🎯 Module Naming Convention

### Main Modules
- Use **singular nouns** representing business domains
- Examples: `products`, `categories`, `orders`, `users`

### Submodules  
- Use **domain-prefix + function** pattern
- Examples: `product-catalog`, `product-inventory`, `category-management`

### Files and Folders
- **Folders**: `kebab-case`
- **Components**: `PascalCase`
- **Hooks**: `camelCase` starting with "use"
- **Types**: `PascalCase` with descriptive names

## 🔗 Module Relationships

### ✅ Allowed Interactions
- Submodules can import from their parent main module's global components
- Modules can use global services from `src/services/`
- Modules can use global types from `src/types/`
- Submodules within the same domain can interact through shared parent components

### ❌ Forbidden Interactions
- Main modules cannot directly import from other main modules
- Submodules cannot directly import from other domains
- No circular dependencies between modules

---

**Next**: [Submodule Rules](./submodule-rules.md)
