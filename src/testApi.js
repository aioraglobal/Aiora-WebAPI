const axios = require('axios');
const xml2js = require('xml2js');

async function testApiConnection() {
  const baseUrl = 'https://affiliate.strawberrynet.com/affiliate/cgi/directListXML.aspx';
  const parser = new xml2js.Parser({ explicitArray: false });

  try {
    console.log('Testing API connection...');
    
    const params = {
      siteid: 'Aiora_Global',
      currency: 'US$',
      langid: '1'
    };

    console.log('Fetching English products...');
    const response = await axios.get(baseUrl, { params });
    
    if (response.status === 200) {
      console.log('✅ API connection successful!');
      console.log(`Response size: ${response.data.length} characters`);
      
      // Parse XML to check structure
      const result = await parser.parseStringPromise(response.data);
      
      if (result.ProductFile && result.ProductFile.Item) {
        const items = Array.isArray(result.ProductFile.Item) 
          ? result.ProductFile.Item 
          : [result.ProductFile.Item];
        
        console.log(`✅ Found ${items.length} products in response`);
        
        // Show first product details
        if (items.length > 0) {
          const firstProduct = items[0];
          console.log('\n📦 First product details:');
          console.log(`  ID: ${firstProduct.ProdId}`);
          console.log(`  Name: ${firstProduct.ProdLangName}`);
          console.log(`  Brand: ${firstProduct.ProdBrandLangName}`);
          console.log(`  Category: ${firstProduct.ProdCatgName}`);
          console.log(`  Price: ${firstProduct.SellingPrice} ${firstProduct.Currency}`);
          console.log(`  Image: ${firstProduct.ImageURL}`);
        }
      } else {
        console.log('❌ No products found in response');
      }
    } else {
      console.log(`❌ API returned status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

async function testChineseApi() {
  const baseUrl = 'https://affiliate.strawberrynet.com/affiliate/cgi/directListXML.aspx';
  const parser = new xml2js.Parser({ explicitArray: false });

  try {
    console.log('\nTesting Chinese API...');
    
    const params = {
      siteid: 'Aiora_Global',
      currency: 'US$',
      langid: '450'
    };

    const response = await axios.get(baseUrl, { params });
    
    if (response.status === 200) {
      console.log('✅ Chinese API connection successful!');
      
      const result = await parser.parseStringPromise(response.data);
      
      if (result.ProductFile && result.ProductFile.Item) {
        const items = Array.isArray(result.ProductFile.Item) 
          ? result.ProductFile.Item 
          : [result.ProductFile.Item];
        
        console.log(`✅ Found ${items.length} Chinese products`);
        
        if (items.length > 0) {
          const firstProduct = items[0];
          console.log('\n📦 First Chinese product:');
          console.log(`  Name: ${firstProduct.ProdLangName}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Chinese API connection failed:', error.message);
  }
}

async function main() {
  console.log('🧪 Testing Strawberrynet API Connection\n');
  
  await testApiConnection();
  await testChineseApi();
  
  console.log('\n✨ API test completed!');
}

if (require.main === module) {
  main();
}

module.exports = { testApiConnection, testChineseApi }; 