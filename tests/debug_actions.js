// Debug script for testing action clicks
// Run this in browser console to debug action issues

console.log('🐛 Starting Action Debug...');

// Test 1: Check if action dropdowns exist
function checkActionButtons() {
    console.log('\n📍 Test 1: Checking action buttons...');
    
    const dropdownTriggers = document.querySelectorAll('[data-radix-dropdown-menu-trigger]');
    console.log(`Found ${dropdownTriggers.length} dropdown triggers`);
    
    const actionButtons = document.querySelectorAll('button');
    console.log(`Found ${actionButtons.length} buttons total`);
    
    // Check for specific action elements
    const moreButtons = document.querySelectorAll('button:has(svg)');
    console.log(`Found ${moreButtons.length} buttons with icons`);
    
    return dropdownTriggers.length > 0;
}

// Test 2: Check if click events are bound
function checkEventListeners() {
    console.log('\n📍 Test 2: Checking event listeners...');
    
    const dropdownTriggers = document.querySelectorAll('[data-radix-dropdown-menu-trigger]');
    
    dropdownTriggers.forEach((trigger, index) => {
        console.log(`Trigger ${index + 1}:`, {
            element: trigger,
            onclick: trigger.onclick,
            hasEventListeners: getEventListeners ? getEventListeners(trigger) : 'Cannot check'
        });
    });
}

// Test 3: Simulate clicking first action button
function simulateActionClick() {
    console.log('\n📍 Test 3: Simulating action click...');
    
    const firstTrigger = document.querySelector('[data-radix-dropdown-menu-trigger]');
    
    if (firstTrigger) {
        console.log('🖱️ Clicking first action button...');
        firstTrigger.click();
        
        // Wait for menu to appear
        setTimeout(() => {
            const menuItems = document.querySelectorAll('[data-radix-dropdown-menu-item]');
            console.log(`Menu opened with ${menuItems.length} items`);
            
            menuItems.forEach((item, index) => {
                console.log(`Menu item ${index + 1}:`, item.textContent);
            });
            
            // Try to click "View Details" if it exists
            const viewDetailsItem = Array.from(menuItems).find(item => 
                item.textContent?.includes('View Details')
            );
            
            if (viewDetailsItem) {
                console.log('🔍 Found View Details item, clicking...');
                viewDetailsItem.click();
            }
        }, 100);
    } else {
        console.log('❌ No action triggers found');
    }
}

// Test 4: Check if router functions are available
function checkRouter() {
    console.log('\n📍 Test 4: Checking router availability...');
    
    if (typeof window !== 'undefined') {
        console.log('✅ Window object available');
        
        if (window.next) {
            console.log('✅ Next.js available');
        } else {
            console.log('❌ Next.js not found on window');
        }
        
        // Check current URL
        console.log('Current URL:', window.location.href);
        console.log('Current pathname:', window.location.pathname);
    }
}

// Test 5: Check console for errors
function checkConsoleErrors() {
    console.log('\n📍 Test 5: Monitor for errors...');
    
    // Override console.error to catch errors
    const originalError = console.error;
    console.error = function(...args) {
        console.log('🚨 Caught error:', ...args);
        originalError.apply(console, args);
    };
    
    console.log('✅ Error monitoring enabled');
}

// Test 6: Manual action test
function testManualAction(productId) {
    console.log('\n📍 Test 6: Manual action test...');
    
    if (!productId) {
        console.log('❌ No product ID provided. Usage: testManualAction("product-id")');
        return;
    }
    
    // Test view action
    console.log('🔍 Testing view action...');
    const viewUrl = `/products/${productId}`;
    console.log('Would navigate to:', viewUrl);
    
    // Test if we can actually navigate
    try {
        window.history.pushState({}, '', viewUrl);
        console.log('✅ Navigation simulated successfully');
        
        // Go back
        window.history.back();
    } catch (error) {
        console.log('❌ Navigation failed:', error);
    }
}

// Main debug function
function debugActions() {
    console.log('🚀 Running complete action debug...');
    
    checkActionButtons();
    checkEventListeners();
    checkRouter();
    checkConsoleErrors();
    
    console.log('\n📋 Debug Summary:');
    console.log('- Use simulateActionClick() to test clicking');
    console.log('- Use testManualAction("product-id") to test navigation');
    console.log('- Check browser console for any errors during clicks');
}

// Auto-run debug
debugActions();

// Export functions for manual testing
window.debugActions = {
    checkActionButtons,
    checkEventListeners,
    simulateActionClick,
    checkRouter,
    testManualAction,
    debugActions
};

console.log('\n✨ Debug functions available on window.debugActions');
console.log('Example: window.debugActions.simulateActionClick()');
