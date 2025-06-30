# System Flow Documentation

This directory contains comprehensive documentation about the PMS system architecture, data flow, and component interactions.

## Contents

- [System Architecture](./architecture.md) - High-level system overview and component relationships
- [Data Flow](./data-flow.md) - Database interactions and data movement patterns
- [Frontend-Backend Integration](./integration.md) - API interactions and communication patterns
- [Authentication Flow](./auth-flow.md) - User authentication and authorization processes

## System Overview

The PMS (Project Management System) is a full-stack application built with modern web technologies:

### Core Components
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with serverless architecture
- **Database**: Supabase (PostgreSQL) with real-time capabilities
- **Storage**: Vercel Blob Storage integrated with Supabase
- **Future Enhancements**: Redis for caching, WebSocket support

### Architecture Patterns
- Server-side rendering with Next.js App Router
- RESTful API design with Next.js API routes
- Real-time updates via Supabase subscriptions
- Component-based UI architecture
- Modular system design for scalability

## Quick Navigation

For specific implementation details, refer to the individual documentation files in this directory.
