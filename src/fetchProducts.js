const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

class ProductFetcher {
  constructor() {
    this.baseUrl = 'https://affiliate.strawberrynet.com/affiliate/cgi/directListXML.aspx';
    this.parser = new xml2js.Parser({ explicitArray: false });
  }

  async fetchProducts(currency = 'US$', langId = '1') {
    try {
      const params = {
        siteid: 'Aiora_Global',
        currency: currency,
        langid: langId
      };

      console.log(`Fetching products with currency: ${currency}, langId: ${langId}`);
      
      const response = await axios.get(this.baseUrl, { params });
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlData = response.data;
      const result = await this.parser.parseStringPromise(xmlData);
      
      return this.convertToProductFormat(result);
    } catch (error) {
      console.error('Error fetching products:', error.message);
      throw error;
    }
  }

  convertToProductFormat(xmlResult) {
    const products = [];
    const categories = new Set();
    
    if (!xmlResult.ProductFile || !xmlResult.ProductFile.Item) {
      console.log('No products found in XML response');
      return { products: [], categories: [] };
    }

    const items = Array.isArray(xmlResult.ProductFile.Item) 
      ? xmlResult.ProductFile.Item 
      : [xmlResult.ProductFile.Item];

    items.forEach((item, index) => {
      try {
        const product = this.convertItemToProduct(item, index + 1);
        if (product) {
          products.push(product);
          categories.add(product.category);
        }
      } catch (error) {
        console.error(`Error converting item ${index}:`, error.message);
      }
    });

    const categoryList = Array.from(categories).map(category => ({
      id: category,
      name: {
        en: category,
        zh: category
      }
    }));

    return {
      products: products,
      categories: categoryList
    };
  }

  convertItemToProduct(item, id) {
    if (!item.ProdId || !item.ProdLangName) {
      return null;
    }

    // Extract basic product information
    const prodId = item.ProdId;
    const prodName = item.ProdLangName;
    const prodBrand = item.ProdBrandLangName || '';
    const prodLine = item.ProdLineLangName || '';
    const prodCatg = item.ProdCatgName || '';
    const photoDesc = item.PhotoDescription || '';
    const imageUrl = item.ImageURL || '';
    const additionalImage1 = item.AdditionalImage1 || '';
    const additionalImage2 = item.AdditionalImage2 || '';

    // Parse prices
    const sellingPrice = parseFloat(item.SellingPrice) || 0;
    const refPrice = parseFloat(item.RefPrice) || 0;
    const currency = item.Currency || 'US$';

    // Convert currency to our format
    const currencyMap = {
      'US$': 'USD',
      'HKD': 'HKD'
    };

    const priceCurrency = currencyMap[currency] || 'USD';

    // Create product object
    const product = {
      id: parseInt(prodId) || id,
      name: {
        en: prodName,
        zh: prodName // We'll need to fetch Chinese version separately
      },
      brand: {
        en: prodBrand,
        zh: prodBrand // We'll need to fetch Chinese version separately
      },
      description: {
        en: photoDesc,
        zh: photoDesc // We'll need to fetch Chinese version separately
      },
      price: {
        [priceCurrency]: sellingPrice
      },
      image: imageUrl,
      category: prodCatg,
      images: []
    };

    // Add additional images if available
    if (additionalImage1) {
      product.images.push(additionalImage1);
    }
    if (additionalImage2) {
      product.images.push(additionalImage2);
    }
    if (imageUrl) {
      product.images.unshift(imageUrl);
    }

    return product;
  }

  mapCategory(originalCategory) {
    const categoryMap = {
      "Men's Fragrance": "fragrance",
      "Women's Fragrance": "fragrance",
      "Unisex Fragrance": "fragrance",
      "Men's Skincare": "skincare",
      "Women's Skincare": "skincare",
      "Unisex Skincare": "skincare",
      "Makeup": "makeup",
      "Men's Makeup": "makeup",
      "Women's Makeup": "makeup"
    };

    return categoryMap[originalCategory] || "skincare";
  }

  getCategoryNameEn(category) {
    const categoryNames = {
      "skincare": "Skincare",
      "makeup": "Makeup",
      "fragrance": "Fragrance"
    };
    return categoryNames[category] || category;
  }

  getCategoryNameZh(category) {
    const categoryNames = {
      "skincare": "護膚品",
      "makeup": "化妝品",
      "fragrance": "香水"
    };
    return categoryNames[category] || category;
  }

  async fetchProductsWithTranslations() {
    try {
      console.log('Fetching English products...');
      const englishProducts = await this.fetchProducts('US$', '1');
      
      console.log('Fetching Chinese products...');
      const chineseProducts = await this.fetchProducts('HKD', '450');

      // Merge the products with translations
      const mergedProducts = this.mergeProductTranslations(
        englishProducts.products, 
        chineseProducts.products
      );

      return {
        products: mergedProducts,
        categories: englishProducts.categories
      };
    } catch (error) {
      console.error('Error fetching products with translations:', error);
      throw error;
    }
  }

  mergeProductTranslations(englishProducts, chineseProducts) {
    const mergedProducts = [];
    const chineseProductMap = new Map();

    // Create a map of Chinese products by ID
    chineseProducts.forEach(product => {
      chineseProductMap.set(product.id, product);
    });

    // Merge English products with Chinese translations and prices
    englishProducts.forEach(englishProduct => {
      const chineseProduct = chineseProductMap.get(englishProduct.id);
      
      if (chineseProduct) {
        // Merge translations
        englishProduct.name.zh = chineseProduct.name.en || englishProduct.name.en;
        englishProduct.description.zh = chineseProduct.description.en || englishProduct.description.en;
        
        // Merge prices - add HKD price from Chinese product
        if (chineseProduct.price.HKD) {
          englishProduct.price.HKD = chineseProduct.price.HKD;
        }
      } else {
        // If no Chinese translation, use English as fallback
        englishProduct.name.zh = englishProduct.name.en;
        englishProduct.description.zh = englishProduct.description.en;
      }

      mergedProducts.push(englishProduct);
    });

    return mergedProducts;
  }

  async saveToFile(data, filename = 'products.json') {
    try {
      const outputPath = path.join(__dirname, '..', 'data', filename);
      await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Products saved to: ${outputPath}`);
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }
}

async function main() {
  const fetcher = new ProductFetcher();
  
  try {
    console.log('Starting product fetch process...');
    
    // Fetch products with translations
    const productData = await fetcher.fetchProductsWithTranslations();
    
    console.log(`Fetched ${productData.products.length} products`);
    console.log(`Categories: ${productData.categories.map(c => c.id).join(', ')}`);
    
    // Save to file
    await fetcher.saveToFile(productData);
    
    console.log('Product fetch process completed successfully!');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = ProductFetcher; 