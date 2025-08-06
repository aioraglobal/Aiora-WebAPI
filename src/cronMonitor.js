const axios = require('axios');

class CronMonitor {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || 'https://aioraglobal-api.vercel.app';
  }

  async checkCronJob() {
    try {
      console.log('Checking cron job status...');
      
      const response = await axios.get(`${this.baseUrl}/api/cron/fetch-products`);
      
      console.log('✅ Cron job executed successfully:');
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Timestamp: ${response.data.timestamp}`);
      console.log(`   Products Count: ${response.data.count}`);
      console.log(`   Categories Count: ${response.data.categories}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Cron job failed:');
      console.error(`   Error: ${error.message}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      throw error;
    }
  }

  async checkProducts() {
    try {
      console.log('Checking products endpoint...');
      
      const response = await axios.get(`${this.baseUrl}/api/products`);
      
      console.log('✅ Products endpoint working:');
      console.log(`   Products Count: ${response.data.products.length}`);
      console.log(`   Categories Count: ${response.data.categories.length}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Products endpoint failed:');
      console.error(`   Error: ${error.message}`);
      throw error;
    }
  }

  async runFullCheck() {
    console.log('🔍 Running full API health check...\n');
    
    try {
      // Check products endpoint
      await this.checkProducts();
      console.log('');
      
      // Check cron job
      await this.checkCronJob();
      console.log('\n✅ All checks passed!');
      
    } catch (error) {
      console.error('\n❌ Health check failed!');
      process.exit(1);
    }
  }
}

// Run if this file is executed directly
if (require.main === module) {
  const monitor = new CronMonitor();
  monitor.runFullCheck();
}

module.exports = CronMonitor; 