# Creating Modules Guide

This guide walks you through creating new modules that follow our architecture standards.

## 🎯 Before You Start

### Ask These Questions:
1. **Is this a new business domain?** → Create a Main Module
2. **Is this a feature within an existing domain?** → Create a Submodule
3. **Is this just a single component?** → Add to existing module's components
4. **Does it qualify as a module?** → Check [Module Definition](../architecture/module-definition.md)

## 📋 Main Module Creation

### Step 1: Plan Your Module
```
Domain: orders
Purpose: Handle order processing and management
Submodules: order-processing, order-tracking, order-fulfillment
```

### Step 2: Create Directory Structure
```bash
mkdir -p src/app/orders
mkdir -p src/app/orders/components
mkdir -p src/app/orders/order-modules
```

### Step 3: Create Main Page
```typescript
// src/app/orders/page.tsx
'use client';

import { SidebarLayout } from '@/components/layout/Sidebar';
import { OrderModuleTabs } from './components/OrderModuleTabs';

export default function OrdersPage() {
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage orders and order processing
          </p>
        </div>
        
        <OrderModuleTabs />
      </div>
    </SidebarLayout>
  );
}
```

### Step 4: Create Global Components
```typescript
// src/app/orders/components/OrderModuleTabs.tsx
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Import your submodules here

export function OrderModuleTabs() {
  return (
    <Tabs defaultValue="processing">
      <TabsList>
        <TabsTrigger value="processing">Processing</TabsTrigger>
        <TabsTrigger value="tracking">Tracking</TabsTrigger>
        <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
      </TabsList>
      
      <TabsContent value="processing">
        {/* Order Processing Submodule */}
      </TabsContent>
      
      <TabsContent value="tracking">
        {/* Order Tracking Submodule */}
      </TabsContent>
      
      <TabsContent value="fulfillment">
        {/* Order Fulfillment Submodule */}
      </TabsContent>
    </Tabs>
  );
}
```

### Step 5: Create Index File
```typescript
// src/app/orders/components/index.ts
export { OrderModuleTabs } from './OrderModuleTabs';
```

## 📋 Submodule Creation

### Step 1: Plan Your Submodule
```
Domain: orders
Submodule: order-processing
Purpose: Handle order creation, validation, and initial processing
Location: src/app/orders/order-modules/order-processing
```

### Step 2: Create Directory Structure
```bash
mkdir -p src/app/orders/order-modules/order-processing/components
mkdir -p src/app/orders/order-modules/order-processing/hooks
mkdir -p src/app/orders/order-modules/order-processing/types
```

### Step 3: Create Components
```typescript
// src/app/orders/order-modules/order-processing/components/OrderProcessingDashboard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrderProcessing } from '../hooks/useOrderProcessing';

export function OrderProcessingDashboard() {
  const { orders, loading, error } = useOrderProcessing();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Order Processing</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Your component content */}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 4: Create Hooks
```typescript
// src/app/orders/order-modules/order-processing/hooks/useOrderProcessing.ts
import { useState, useEffect } from 'react';
import { OrderService } from '@/services/orders';
import { Order } from '../types';

export function useOrderProcessing() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await OrderService.getProcessingOrders();
        setOrders(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, loading, error };
}
```

### Step 5: Create Types
```typescript
// src/app/orders/order-modules/order-processing/types/index.ts
export interface Order {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  customer_id: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderProcessingState {
  orders: Order[];
  filters: OrderFilters;
  pagination: PaginationState;
}

export interface OrderFilters {
  status?: string;
  date_range?: {
    start: string;
    end: string;
  };
}
```

### Step 6: Create Index Files
```typescript
// src/app/orders/order-modules/order-processing/components/index.ts
export { OrderProcessingDashboard } from './OrderProcessingDashboard';

// src/app/orders/order-modules/order-processing/hooks/index.ts
export { useOrderProcessing } from './useOrderProcessing';

// src/app/orders/order-modules/order-processing/types/index.ts
export * from './index';
```

### Step 7: Create Page (Optional)
```typescript
// src/app/orders/order-modules/order-processing/page.tsx
'use client';

import { OrderProcessingDashboard } from './components';

export default function OrderProcessingPage() {
  return <OrderProcessingDashboard />;
}
```

## ✅ Validation Checklist

### Module Structure
- [ ] Has `components/` folder with at least one component
- [ ] Has `hooks/` folder (can start empty)
- [ ] Has `types/` folder with type definitions
- [ ] Has `index.ts` files in each folder
- [ ] Has `page.tsx` if the module is routable

### Naming Convention
- [ ] Module name uses kebab-case
- [ ] Submodules are prefixed with domain name
- [ ] Components use PascalCase
- [ ] Hooks start with "use" and use camelCase
- [ ] Types use PascalCase

### Code Quality
- [ ] Components are focused on single responsibility
- [ ] Hooks contain reusable logic
- [ ] Types are well-defined and exported
- [ ] No circular dependencies
- [ ] Follows existing patterns

### Integration
- [ ] Integrates with parent module's tab system
- [ ] Uses global services from `src/services/`
- [ ] Uses global types when appropriate
- [ ] Follows communication patterns

## 🔧 Common Patterns

### 1. Data Fetching Hook
```typescript
export function useModuleData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch logic here
  
  return { data, loading, error, refetch };
}
```

### 2. Form Hook
```typescript
export function useModuleForm(initialData) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form logic here
  
  return { formData, errors, isSubmitting, handleSubmit };
}
```

### 3. Dashboard Component
```typescript
export function ModuleDashboard() {
  const { data, loading, error } = useModuleData();

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="space-y-4">
      <ModuleHeader />
      <ModuleContent data={data} />
    </div>
  );
}
```

## 🚫 Common Mistakes

### ❌ Don't Do This:
```typescript
// Importing from other main modules
import { ProductCard } from '../../products/components/ProductCard';

// Creating modules without proper structure
single-file-module/
└── page.tsx

// Mixed concerns in one module
mixed-module/
├── components/
│   ├── ProductCard.tsx    ← Product concern
│   └── UserProfile.tsx    ← User concern (wrong!)
```

### ✅ Do This Instead:
```typescript
// Use global services
import { ProductService } from '@/services/products';

// Create proper module structure
proper-module/
├── components/
├── hooks/
├── types/
└── page.tsx

// Keep concerns separated
order-processing/           ← Only order processing
├── components/
│   ├── OrderList.tsx      ← Order-related only
│   └── OrderForm.tsx      ← Order-related only
```

## 📚 Resources

- [Module Definition](../architecture/module-definition.md)
- [Product Module Example](../examples/product-module.md)
- [Best Practices](./best-practices.md)
- [Naming Conventions](./naming-conventions.md)

---

**Need Help?** Check the [Troubleshooting Guide](./troubleshooting.md)
