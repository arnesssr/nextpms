// Simple test script to verify order services are working
console.log('🚀 ORDER SERVICES TEST - SIMPLE VERSION\n');

// Since we can't directly import TypeScript modules in Node.js,
// we'll test the API endpoints instead to verify the services are working

const API_BASE = 'http://localhost:3000/api';

// Helper function to make API calls
async function testAPI(method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Test results
let totalTests = 0;
let passed = 0;
let failed = 0;

function logTest(name, success, details = '') {
  totalTests++;
  if (success) {
    passed++;
    console.log(`✅ ${name}`);
  } else {
    failed++;
    console.log(`❌ ${name}`);
  }
  if (details) {
    console.log(`   ${details}`);
  }
}

// Run tests
async function runTests() {
  console.log('Testing Order Service Endpoints:\n');

  // Test 1: Get Orders
  console.log('1. Testing GET /api/orders');
  const ordersResult = await testAPI('GET', '/orders?limit=5');
  logTest(
    'Get Orders', 
    ordersResult.ok && ordersResult.data.success,
    ordersResult.ok ? `Found ${ordersResult.data.data?.length || 0} orders` : ordersResult.error || 'Failed'
  );

  // Test 2: Get Order Stats
  console.log('\n2. Testing GET /api/orders/stats');
  const statsResult = await testAPI('GET', '/orders/stats');
  logTest(
    'Get Order Stats', 
    statsResult.ok && statsResult.data.success,
    statsResult.ok ? `Total orders: ${statsResult.data.data?.total_orders || 0}` : statsResult.error || 'Failed'
  );

  // Test 3: Search Customers
  console.log('\n3. Testing GET /api/customers/search');
  const customersResult = await testAPI('GET', '/customers/search?q=test');
  logTest(
    'Search Customers', 
    customersResult.ok && customersResult.data.success !== false,
    customersResult.ok ? `Found ${customersResult.data.data?.length || 0} customers` : customersResult.error || 'Failed'
  );

  // Test 4: Search Products
  console.log('\n4. Testing GET /api/products/search');
  const productsResult = await testAPI('GET', '/products/search?q=test');
  logTest(
    'Search Products', 
    productsResult.ok && productsResult.data.success !== false,
    productsResult.ok ? `Found ${productsResult.data.data?.length || 0} products` : productsResult.error || 'Failed'
  );

  // Test 5: Get Order Tracking
  console.log('\n5. Testing GET /api/orders/tracking');
  const trackingResult = await testAPI('GET', '/orders/tracking');
  logTest(
    'Get Order Tracking', 
    trackingResult.ok && trackingResult.data.success,
    trackingResult.ok ? `Found ${trackingResult.data.data?.length || 0} tracked orders` : trackingResult.error || 'Failed'
  );

  // Test 6: Get Returns
  console.log('\n6. Testing GET /api/orders/returns');
  const returnsResult = await testAPI('GET', '/orders/returns');
  logTest(
    'Get Returns', 
    returnsResult.ok && returnsResult.data.success,
    returnsResult.ok ? `Found ${returnsResult.data.data?.length || 0} returns` : returnsResult.error || 'Failed'
  );

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('TEST SUMMARY:');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / totalTests) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
  } else {
    console.log('\n⚠️  Some tests failed. Make sure the Next.js dev server is running on http://localhost:3000');
  }
}

// Check if we're running in a browser or Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment
  console.log('⚠️  This test requires the Next.js development server to be running.');
  console.log('   Please run "npm run dev" in another terminal first.\n');
  
  // In Node.js 18+, fetch is available globally
  // For older versions, you might need to install node-fetch
  runTests().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
} else {
  // Browser environment
  runTests();
}
