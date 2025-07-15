#!/usr/bin/env python3
"""
Test script for module-level services in the orders module.
Tests client-side hooks and services that make HTTP requests to the API.
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from typing import Dict, Any, List
from colorama import init, Fore, Style

# Initialize colorama for colored output
init()

# Configuration
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

# Test data
TEST_ORDER = {
    "customer_id": "test-customer-123",
    "items": [
        {
            "product_id": "prod-001",
            "quantity": 2,
            "price": 29.99,
            "name": "Test Product 1"
        },
        {
            "product_id": "prod-002",
            "quantity": 1,
            "price": 49.99,
            "name": "Test Product 2"
        }
    ],
    "shipping_address": {
        "street": "123 Test St",
        "city": "Test City",
        "state": "TS",
        "zip": "12345",
        "country": "USA"
    },
    "payment_method": "credit_card",
    "payment_details": {
        "last4": "4242",
        "brand": "visa"
    }
}

class ModuleServiceTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.created_order_id = None
        
    async def setup(self):
        """Setup the test session"""
        self.session = aiohttp.ClientSession()
        
    async def teardown(self):
        """Cleanup the test session"""
        if self.session:
            await self.session.close()
            
    def log_test(self, name: str, status: str, details: str = ""):
        """Log test result with color"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        if status == "PASS":
            print(f"{Fore.GREEN}[{timestamp}] ✓ {name}{Style.RESET_ALL}")
        elif status == "FAIL":
            print(f"{Fore.RED}[{timestamp}] ✗ {name}{Style.RESET_ALL}")
            if details:
                print(f"  {Fore.YELLOW}Details: {details}{Style.RESET_ALL}")
        else:
            print(f"{Fore.BLUE}[{timestamp}] ℹ {name}{Style.RESET_ALL}")
            
        self.test_results.append({
            "name": name,
            "status": status,
            "details": details,
            "timestamp": timestamp
        })
        
    async def test_order_create_service(self):
        """Test order creation through module service"""
        test_name = "Order Create Service"
        
        try:
            # Simulate what the module service does
            async with self.session.post(
                f"{API_BASE}/orders/order-create",
                json=TEST_ORDER,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.created_order_id = data.get("id")
                    self.log_test(test_name, "PASS", f"Created order ID: {self.created_order_id}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_test(test_name, "FAIL", f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test(test_name, "FAIL", str(e))
            return False
            
    async def test_order_list_service(self):
        """Test order listing through module service"""
        test_name = "Order List Service"
        
        try:
            # Test with various filters
            filters = [
                {},  # No filters
                {"status": "pending"},
                {"customer_id": "test-customer-123"},
                {"date_from": "2024-01-01", "date_to": "2024-12-31"}
            ]
            
            all_passed = True
            for filter_params in filters:
                query_string = "&".join([f"{k}={v}" for k, v in filter_params.items()])
                url = f"{API_BASE}/orders/order-list"
                if query_string:
                    url += f"?{query_string}"
                    
                async with self.session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        filter_desc = json.dumps(filter_params) if filter_params else "no filters"
                        self.log_test(f"{test_name} - {filter_desc}", "PASS", 
                                    f"Found {len(data)} orders")
                    else:
                        all_passed = False
                        error_text = await response.text()
                        self.log_test(f"{test_name} - {json.dumps(filter_params)}", "FAIL", 
                                    f"Status {response.status}: {error_text}")
                                    
            return all_passed
        except Exception as e:
            self.log_test(test_name, "FAIL", str(e))
            return False
            
    async def test_order_fulfillment_service(self):
        """Test order fulfillment through module service"""
        test_name = "Order Fulfillment Service"
        
        if not self.created_order_id:
            self.log_test(test_name, "SKIP", "No order ID available")
            return False
            
        try:
            # Test fulfillment operations
            fulfillment_data = {
                "status": "processing",
                "tracking_number": "TRACK123456",
                "carrier": "UPS",
                "shipped_items": [
                    {"product_id": "prod-001", "quantity": 2}
                ]
            }
            
            async with self.session.post(
                f"{API_BASE}/orders/order-fulfillment/{self.created_order_id}",
                json=fulfillment_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test(test_name, "PASS", "Fulfillment updated successfully")
                    
                    # Test getting fulfillment status
                    async with self.session.get(
                        f"{API_BASE}/orders/order-fulfillment/{self.created_order_id}"
                    ) as get_response:
                        if get_response.status == 200:
                            status_data = await get_response.json()
                            self.log_test(f"{test_name} - Get Status", "PASS", 
                                        f"Status: {status_data.get('status', 'unknown')}")
                            return True
                        else:
                            self.log_test(f"{test_name} - Get Status", "FAIL", 
                                        f"Status {get_response.status}")
                            return False
                else:
                    error_text = await response.text()
                    self.log_test(test_name, "FAIL", f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test(test_name, "FAIL", str(e))
            return False
            
    async def test_order_returns_service(self):
        """Test order returns through module service"""
        test_name = "Order Returns Service"
        
        if not self.created_order_id:
            self.log_test(test_name, "SKIP", "No order ID available")
            return False
            
        try:
            # Create a return
            return_data = {
                "order_id": self.created_order_id,
                "reason": "defective",
                "items": [
                    {"product_id": "prod-001", "quantity": 1}
                ],
                "refund_amount": 29.99,
                "notes": "Product not working as expected"
            }
            
            async with self.session.post(
                f"{API_BASE}/orders/order-returns",
                json=return_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return_id = data.get("id")
                    self.log_test(test_name, "PASS", f"Created return ID: {return_id}")
                    
                    # Test getting return details
                    if return_id:
                        async with self.session.get(
                            f"{API_BASE}/orders/order-returns/{return_id}"
                        ) as get_response:
                            if get_response.status == 200:
                                return_details = await get_response.json()
                                self.log_test(f"{test_name} - Get Details", "PASS", 
                                            f"Return status: {return_details.get('status', 'unknown')}")
                                return True
                            else:
                                self.log_test(f"{test_name} - Get Details", "FAIL", 
                                            f"Status {get_response.status}")
                                return False
                else:
                    error_text = await response.text()
                    self.log_test(test_name, "FAIL", f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test(test_name, "FAIL", str(e))
            return False
            
    async def test_order_tracking_service(self):
        """Test order tracking through module service"""
        test_name = "Order Tracking Service"
        
        if not self.created_order_id:
            self.log_test(test_name, "SKIP", "No order ID available")
            return False
            
        try:
            # Add tracking info
            tracking_data = {
                "tracking_number": "TRACK123456",
                "carrier": "UPS",
                "status": "in_transit",
                "location": "Distribution Center",
                "estimated_delivery": "2024-01-25"
            }
            
            async with self.session.post(
                f"{API_BASE}/orders/order-tracking/{self.created_order_id}",
                json=tracking_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test(test_name, "PASS", "Tracking info updated")
                    
                    # Test getting tracking info
                    async with self.session.get(
                        f"{API_BASE}/orders/order-tracking/{self.created_order_id}"
                    ) as get_response:
                        if get_response.status == 200:
                            tracking_info = await get_response.json()
                            self.log_test(f"{test_name} - Get Info", "PASS", 
                                        f"Tracking: {tracking_info.get('tracking_number', 'N/A')}")
                            return True
                        else:
                            self.log_test(f"{test_name} - Get Info", "FAIL", 
                                        f"Status {get_response.status}")
                            return False
                else:
                    error_text = await response.text()
                    self.log_test(test_name, "FAIL", f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test(test_name, "FAIL", str(e))
            return False
            
    async def test_search_services(self):
        """Test search functionality through module services"""
        test_name = "Search Services"
        
        try:
            # Test customer search
            customer_query = {"query": "test", "limit": 10}
            async with self.session.post(
                f"{API_BASE}/orders/search-customers",
                json=customer_query,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test(f"{test_name} - Customer Search", "PASS", 
                                f"Found {len(data)} customers")
                else:
                    error_text = await response.text()
                    self.log_test(f"{test_name} - Customer Search", "FAIL", 
                                f"Status {response.status}: {error_text}")
                    
            # Test product search
            product_query = {"query": "product", "category": "all", "limit": 10}
            async with self.session.post(
                f"{API_BASE}/orders/search-products",
                json=product_query,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test(f"{test_name} - Product Search", "PASS", 
                                f"Found {len(data)} products")
                    return True
                else:
                    error_text = await response.text()
                    self.log_test(f"{test_name} - Product Search", "FAIL", 
                                f"Status {response.status}: {error_text}")
                    return False
                    
        except Exception as e:
            self.log_test(test_name, "FAIL", str(e))
            return False
            
    async def test_hook_integration(self):
        """Test that hooks properly integrate with services"""
        test_name = "Hook Integration"
        
        try:
            # Simulate hook behavior - testing state management
            self.log_test(test_name, "INFO", "Testing hook state management simulation")
            
            # Test optimistic updates
            async with self.session.get(f"{API_BASE}/orders/order-list") as response:
                if response.status == 200:
                    initial_orders = await response.json()
                    initial_count = len(initial_orders)
                    
                    # Create new order
                    async with self.session.post(
                        f"{API_BASE}/orders/order-create",
                        json=TEST_ORDER,
                        headers={"Content-Type": "application/json"}
                    ) as create_response:
                        if create_response.status == 200:
                            # Check if list reflects new order
                            async with self.session.get(f"{API_BASE}/orders/order-list") as list_response:
                                if list_response.status == 200:
                                    updated_orders = await list_response.json()
                                    updated_count = len(updated_orders)
                                    
                                    if updated_count > initial_count:
                                        self.log_test(f"{test_name} - State Update", "PASS", 
                                                    "Order list updated after creation")
                                        return True
                                    else:
                                        self.log_test(f"{test_name} - State Update", "FAIL", 
                                                    "Order list not updated")
                                        return False
                                        
            self.log_test(test_name, "FAIL", "Failed to test hook integration")
            return False
            
        except Exception as e:
            self.log_test(test_name, "FAIL", str(e))
            return False
            
    async def run_all_tests(self):
        """Run all module service tests"""
        print(f"\n{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}Starting Module Service Tests{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}\n")
        
        await self.setup()
        
        # Run tests in order
        tests = [
            self.test_order_create_service,
            self.test_order_list_service,
            self.test_order_fulfillment_service,
            self.test_order_returns_service,
            self.test_order_tracking_service,
            self.test_search_services,
            self.test_hook_integration
        ]
        
        for test in tests:
            await test()
            await asyncio.sleep(0.5)  # Small delay between tests
            
        await self.teardown()
        
        # Print summary
        print(f"\n{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}Test Summary{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}\n")
        
        passed = sum(1 for r in self.test_results if r["status"] == "PASS")
        failed = sum(1 for r in self.test_results if r["status"] == "FAIL")
        skipped = sum(1 for r in self.test_results if r["status"] == "SKIP")
        info = sum(1 for r in self.test_results if r["status"] == "INFO")
        
        print(f"{Fore.GREEN}Passed: {passed}{Style.RESET_ALL}")
        print(f"{Fore.RED}Failed: {failed}{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Skipped: {skipped}{Style.RESET_ALL}")
        print(f"{Fore.BLUE}Info: {info}{Style.RESET_ALL}")
        
        total_tests = passed + failed + skipped
        if total_tests > 0:
            success_rate = (passed / total_tests) * 100
            print(f"\n{Fore.CYAN}Success Rate: {success_rate:.1f}%{Style.RESET_ALL}")
            
            if success_rate == 100:
                print(f"\n{Fore.GREEN}✓ All module service tests passed!{Style.RESET_ALL}")
            elif success_rate >= 80:
                print(f"\n{Fore.YELLOW}⚠ Most module service tests passed with some issues{Style.RESET_ALL}")
            else:
                print(f"\n{Fore.RED}✗ Module service tests need attention{Style.RESET_ALL}")
                
        # Save results to file
        with open("module_service_test_results.json", "w") as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "summary": {
                    "passed": passed,
                    "failed": failed,
                    "skipped": skipped,
                    "info": info,
                    "success_rate": success_rate if total_tests > 0 else 0
                },
                "results": self.test_results
            }, f, indent=2)
            
        print(f"\n{Fore.BLUE}Results saved to module_service_test_results.json{Style.RESET_ALL}")

async def main():
    """Main test runner"""
    print(f"{Fore.YELLOW}Module Service Test Suite{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}Testing client-side hooks and services{Style.RESET_ALL}")
    print(f"\n{Fore.BLUE}Make sure the development server is running on {BASE_URL}{Style.RESET_ALL}\n")
    
    # Give user time to ensure server is running
    print(f"{Fore.YELLOW}Starting tests in 3 seconds...{Style.RESET_ALL}")
    time.sleep(3)
    
    tester = ModuleServiceTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
