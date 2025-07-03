// Quick test script to verify category display fix
// Run this in your browser console after the changes

async function testCategoryDisplay() {
    console.log('🔍 Testing Category Display Fix...');
    
    try {
        // Test the API endpoint directly
        console.log('\n📡 Testing API endpoint...');
        const response = await fetch('/api/products?limit=5');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            console.log('✅ API is working');
            
            result.data.forEach((product, index) => {
                console.log(`📦 Product ${index + 1}:`, {
                    name: product.name,
                    category_id: product.category_id,
                    category_name: product.category_name,
                    category_path: product.category_path,
                    status: product.status
                });
            });
            
            const productsWithCategories = result.data.filter(p => p.category_name && p.category_name !== 'Uncategorized');
            const productsWithoutCategories = result.data.filter(p => !p.category_name || p.category_name === 'Uncategorized');
            
            console.log(`\n📊 Summary:`);
            console.log(`✅ Products with valid categories: ${productsWithCategories.length}`);
            console.log(`⚠️ Products showing "Uncategorized": ${productsWithoutCategories.length}`);
            
            if (productsWithoutCategories.length > 0) {
                console.log('\n🔍 Products that need category fixes:');
                productsWithoutCategories.forEach(product => {
                    console.log(`- ${product.name} (ID: ${product.id}, Category ID: ${product.category_id || 'null'})`);
                });
            }
        } else {
            console.error('❌ API test failed:', result.error || 'No data returned');
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Auto-run the test
testCategoryDisplay();
