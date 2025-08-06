const express = require('express');
const cors = require('cors');
const ProductFetcher = require('./fetchProducts');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize product fetcher
const productFetcher = new ProductFetcher();

// Helper function to get products file path
const getProductsPath = () => path.join(__dirname, '..', 'data', 'products.json');

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const productsPath = getProductsPath();
    const data = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(data);
    res.json(products);
  } catch (error) {
    console.error('Error reading products:', error);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productsPath = getProductsPath();
    const data = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(data);
    const product = products.products.find(p => p.id === parseInt(req.params.id));
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error reading product:', error);
    res.status(500).json({ error: 'Failed to load product' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const productsPath = getProductsPath();
    const data = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(data);
    res.json(products.categories);
  } catch (error) {
    console.error('Error reading categories:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

app.get('/api/products/category/:category', async (req, res) => {
  try {
    const productsPath = getProductsPath();
    const data = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(data);
    const filteredProducts = products.products.filter(p => p.category === req.params.category);
    res.json(filteredProducts);
  } catch (error) {
    console.error('Error reading products by category:', error);
    res.status(500).json({ error: 'Failed to load products by category' });
  }
});

// Admin route to fetch fresh data from API
app.post('/api/admin/fetch-products', async (req, res) => {
  try {
    console.log('Admin request to fetch fresh products...');
    
    const productData = await productFetcher.fetchProductsWithTranslations();
    await productFetcher.saveToFile(productData);
    
    res.json({ 
      message: 'Products fetched and saved successfully',
      count: productData.products.length,
      categories: productData.categories.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Cron job endpoint to fetch products automatically
app.get('/api/cron/fetch-products', async (req, res) => {
  try {
    console.log('Cron job: Fetching fresh products...');
    
    const productData = await productFetcher.fetchProductsWithTranslations();
    await productFetcher.saveToFile(productData);
    
    console.log(`Cron job completed: Fetched ${productData.products.length} products`);
    
    res.json({ 
      message: 'Cron job: Products fetched and saved successfully',
      timestamp: new Date().toISOString(),
      count: productData.products.length,
      categories: productData.categories.length
    });
  } catch (error) {
    console.error('Cron job error fetching products:', error);
    res.status(500).json({ 
      error: 'Cron job failed to fetch products',
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Aiora WebAPI is running',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      productById: '/api/products/:id',
      productsByCategory: '/api/products/category/:category'
    }
  });
});

// Start server only if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Aiora WebAPI server running on port ${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`  GET  /api/products - Get all products`);
    console.log(`  GET  /api/products/:id - Get product by ID`);
    console.log(`  GET  /api/categories - Get all categories`);
    console.log(`  GET  /api/products/category/:category - Get products by category`);
    console.log(`  POST /api/admin/fetch-products - Fetch fresh data from Strawberrynet API`);
    console.log(`  GET  /api/cron/fetch-products - Cron job endpoint (runs daily at midnight)`);
  });
}

// Export for Vercel serverless
module.exports = app; 