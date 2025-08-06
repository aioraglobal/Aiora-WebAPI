const fs = require('fs').promises;
const path = require('path');

async function showSample() {
  try {
    const productsPath = path.join(__dirname, '..', 'data', 'products.json');
    const data = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(data);
    
    console.log('📊 Product Data Summary:');
    console.log(`Total products: ${products.products.length}`);
    console.log(`Categories: ${products.categories.map(c => c.id).join(', ')}`);
    
    console.log('\n📦 Sample Products:');
    products.products.slice(0, 3).forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name.en}`);
      console.log(`   Chinese: ${product.name.zh}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: ${Object.entries(product.price).map(([curr, price]) => `${price} ${curr}`).join(', ')}`);
      console.log(`   Images: ${product.images.length} images`);
    });
    
    console.log('\n🏷️ Categories:');
    products.categories.forEach(category => {
      console.log(`  ${category.id}: ${category.name.en} / ${category.name.zh}`);
    });
    
  } catch (error) {
    console.error('Error reading products:', error);
  }
}

if (require.main === module) {
  showSample();
}

module.exports = { showSample }; 