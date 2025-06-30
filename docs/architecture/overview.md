# System Architecture Overview

## 🎯 Architecture Philosophy

This software follows a **Domain-Driven Modular Architecture** where:

1. **Business domains** (Products, Categories, Orders) become **main modules**
2. **Functional areas** within domains become **submodules**
3. **Everything has a clear home** and follows consistent patterns
4. **No code orphans** - every file belongs to a specific module

## 🏗️ Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────── │
│  │   UI COMPONENTS │ │     PAGES       │ │     LAYOUTS     │
│  └─────────────────┘ └─────────────────┘ └──────────────── │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        MODULE LAYER                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────── │
│  │    PRODUCTS     │ │   CATEGORIES    │ │     ORDERS      │
│  │                 │ │                 │ │                 │
│  │ ├─ catalog      │ │ ├─ management   │ │ ├─ processing   │
│  │ ├─ inventory    │ │ ├─ tree-view    │ │ ├─ tracking     │
│  │ ├─ pricing      │ │ └─ analytics    │ │ └─ fulfillment  │
│  │ └─ creation     │ │                 │ │                 │
│  └─────────────────┘ └─────────────────┘ └──────────────── │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────── │
│  │      API        │ │    UTILITIES    │ │      TYPES      │
│  │   SERVICES      │ │   FUNCTIONS     │ │   DEFINITIONS   │
│  └─────────────────┘ └─────────────────┘ └──────────────── │
└─────────────────────────────────────────────────────────────┘
```

## 📂 Directory Structure

```
src/
├── app/                          ← Next.js App Router
│   ├── products/                 ← 🟦 MAIN MODULE
│   │   ├── page.tsx              ← Module dashboard
│   │   ├── components/           ← Global module components
│   │   └── product-modules/      ← Submodules container
│   │       ├── product-catalog/  ← 🟨 SUBMODULE
│   │       ├── inventory-mgmt/   ← 🟨 SUBMODULE
│   │       └── pricing-mgmt/     ← 🟨 SUBMODULE
│   ├── categories/               ← 🟦 MAIN MODULE
│   │   ├── page.tsx
│   │   ├── components/
│   │   └── category-modules/     ← Submodules container
│   └── orders/                   ← 🟦 MAIN MODULE
├── components/                   ← Global UI components
├── lib/                          ← Utilities & configuration
├── services/                     ← Centralized API services
└── types/                        ← Global type definitions
```

## 🔍 Module Hierarchy

### Level 1: Main Modules (Business Domains)
- **Products** - Product management domain
- **Categories** - Category management domain  
- **Orders** - Order processing domain
- **Users** - User management domain

### Level 2: Submodules (Functional Areas)
- **product-catalog** - Browse and view products
- **product-inventory** - Stock management
- **product-pricing** - Price management
- **category-management** - CRUD operations
- **category-tree** - Hierarchical view

### Level 3: Components (Implementation)
- **components/** - UI components
- **hooks/** - Custom React hooks
- **types/** - TypeScript definitions
- **services/** - Module-specific services (deprecated - moved to central)

## 🎯 Key Principles

### 1. Domain Separation
Each main module represents a **business domain**:
- Products handle everything product-related
- Categories handle everything category-related
- No cross-domain pollution

### 2. Functional Decomposition
Within each domain, functionality is split into **logical submodules**:
- Each submodule has a specific purpose
- Submodules can interact but remain independent
- Easy to add/remove features

### 3. Consistent Structure
Every module/submodule follows the **same internal structure**:
```
module-name/
├── components/    ← UI components
├── hooks/         ← Custom hooks
├── types/         ← Type definitions
└── page.tsx       ← Main page (if routable)
```

### 4. Clear Boundaries
- **No direct file imports** across main modules
- **Communication through APIs** and global services
- **Shared code** goes in global directories

## 🚀 Benefits

1. **Scalability** - Easy to add new domains and features
2. **Maintainability** - Clear structure makes code easy to find and modify
3. **Team Collaboration** - Different teams can work on different modules
4. **Testing** - Modules can be tested in isolation
5. **Code Reuse** - Common patterns emerge and can be abstracted

## 📏 Module Qualification Rules

See [module-definition.md](./module-definition.md) for detailed rules on what qualifies as a module.

---

**Next**: [Module Definition](./module-definition.md)
