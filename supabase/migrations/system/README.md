# System & Utility Migrations

This folder contains system utilities, foreign key constraints, and debugging tools.

## Files in this folder:
- `003_add_foreign_keys.sql` - Initial foreign key constraints setup
- `003_add_foreign_keys_fixed.sql` - Fixed version of foreign key constraints
- `006_disable_rls_for_testing.sql` - Development utility to disable RLS for testing

## Purpose:
- Database relationship integrity
- Development and testing utilities
- System maintenance scripts
- Performance optimization

## Warning:
- Files in this folder can affect database security and integrity
- Use with caution in production environments
- Testing utilities should not be run in production
