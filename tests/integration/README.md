# Integration Tests

This folder contains comprehensive integration tests that verify the interaction between different system components.

## Files in this folder:
- `ServiceIntegrationTestPage.tsx` - React component for service layer testing (moved from /src/app/service-integration-test/page.tsx)
- `test_products_integration.js` - Complete integration test for products system
- `verify_architecture.js` - Architecture verification scripts

## How to use:

### React Component Tests:
- These files can be imported into your test application or run as standalone pages
- Example: Create a test route that renders `ServiceIntegrationTestPage`

### JavaScript Integration Tests:
1. Open browser developer tools
2. Navigate to the relevant application page
3. Run scripts in console to test full workflows

## Purpose:
- End-to-end system testing
- Service layer verification
- API integration testing
- Cross-component functionality validation
