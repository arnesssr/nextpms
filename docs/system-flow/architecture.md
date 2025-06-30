# System Architecture

## High-Level Overview

The PMS follows a modern full-stack architecture with clear separation of concerns and modular design principles.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router │ React Components │ TypeScript         │
│  Tailwind CSS       │ Module System    │ Client State       │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Next.js API Routes │ Server Actions   │ Middleware         │
│  Authentication     │ Validation       │ Error Handling     │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL │ Real-time      │ RPC Functions      │
│  Row Level Security  │ Subscriptions  │ Storage Buckets    │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Module System
The frontend follows a strict modular architecture where each feature is contained within its own module:

```
src/modules/
├── product-catalog/
│   ├── components/     # UI components specific to this module
│   ├── hooks/          # Custom hooks for data fetching and state
│   ├── types/          # TypeScript interfaces and types
│   └── index.ts        # Module exports
├── product-creation/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── index.ts
└── common/             # Shared utilities and components
    ├── components/
    ├── hooks/
    ├── types/
    └── utils/
```

### Component Hierarchy
- **Pages**: Next.js App Router pages that orchestrate modules
- **Modules**: Self-contained feature modules
- **Components**: Reusable UI components within modules
- **Hooks**: Custom React hooks for business logic
- **Types**: TypeScript definitions for data structures

## Backend Architecture

### API Structure
```
src/app/api/
├── products/
│   ├── route.ts           # GET, POST /api/products
│   ├── [id]/
│   │   └── route.ts       # GET, PUT, DELETE /api/products/[id]
│   └── bulk/
│       └── route.ts       # POST /api/products/bulk
├── categories/
│   └── route.ts           # Category management
└── auth/
    └── route.ts           # Authentication endpoints
```

### Database Layer

#### Core Tables
- **products**: Main product information
- **categories**: Product categories with hierarchical support
- **product_categories**: Many-to-many relationship table
- **users**: User authentication and profiles

#### RPC Functions
- `get_products_with_categories()`: Optimized product fetching with category data
- `bulk_update_products()`: Efficient bulk operations
- `get_category_hierarchy()`: Hierarchical category retrieval

## Data Flow Patterns

### Read Operations
1. Frontend component mounts
2. Custom hook initiates API call
3. API route validates request
4. Database query executed (often via RPC)
5. Data returned through the chain
6. Component state updated
7. UI re-renders

### Write Operations
1. User interaction triggers action
2. Form validation on frontend
3. API call with validated data
4. Server-side validation
5. Database transaction
6. Response sent to frontend
7. Optimistic UI updates or refetch

## Security Architecture

### Authentication
- Supabase Auth for user management
- JWT tokens for session management
- Row Level Security (RLS) policies

### Authorization
- Role-based access control
- Module-level permissions
- API route protection

### Data Validation
- Frontend: React Hook Form with Zod schemas
- Backend: Server-side validation before database operations
- Database: Constraints and triggers

## Performance Considerations

### Caching Strategy
- Next.js automatic caching for static content
- API route caching for expensive operations
- Future: Redis for application-level caching

### Optimization Techniques
- Server-side rendering for initial page loads
- Client-side navigation for subsequent interactions
- Optimistic UI updates for better user experience
- Database query optimization with proper indexing

## Scalability Design

### Horizontal Scaling
- Stateless API design
- Database connection pooling
- CDN for static assets

### Vertical Scaling
- Efficient database queries
- Lazy loading for large datasets
- Background job processing for heavy operations

## Monitoring and Observability

### Logging
- Structured logging for API routes
- Error tracking and reporting
- Performance monitoring

### Health Checks
- Database connectivity monitoring
- API endpoint health checks
- Real-time system status dashboard
