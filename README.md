# Aiora WebAPI

This is a Node.js application that fetches product data from the Strawberrynet affiliate API and converts it to the format used by the Aiora WebApp.

## Features

- Fetches product data from Strawberrynet API
- Converts XML data to JSON format
- Supports both English and Chinese translations
- Provides REST API endpoints for accessing product data
- Automatically maps categories and currencies

## Installation

1. Navigate to the Aiora-WebAPI directory:
```bash
cd Aiora-WebAPI
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Fetch Products from API

To fetch fresh product data from the Strawberrynet API:

```bash
npm run fetch-products
```

This will:
- Fetch English products (langid=1)
- Fetch Chinese products (langid=450)
- Merge translations
- Save the result to `Aiora-WebAPI/data/products.json`

### Start the API Server

To start the Express API server:

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

The server will run on port 3001 by default.

## API Endpoints

### Product Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category
- `GET /api/categories` - Get all categories

### Admin Endpoints

- `POST /api/admin/fetch-products` - Fetch fresh data from Strawberrynet API
- `GET /api/health` - Health check

## Data Format

The program converts the XML response from Strawberrynet API to match the format used in your existing `products.json`:

```json
{
  "products": [
    {
      "id": 1,
      "name": {
        "en": "Product Name",
        "zh": "產品名稱"
      },
      "description": {
        "en": "Product description",
        "zh": "產品描述"
      },
      "price": {
        "USD": 99.99,
        "HKD": 780.00
      },
      "image": "https://example.com/image.jpg",
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "category": "skincare"
    }
  ],
  "categories": [
    {
      "id": "skincare",
      "name": {
        "en": "Skincare",
        "zh": "護膚品"
      }
    }
  ]
}
```

## File Structure

```
Aiora-WebAPI/
├── src/
│   ├── fetchProducts.js    # Main product fetcher
│   ├── index.js           # Express API server
│   ├── testApi.js         # API connection tester
│   └── showSample.js      # Data sample viewer
├── data/
│   └── products.json      # Generated product data
├── package.json
└── README.md
```

## Currency and Language Mapping

- **Currency**: `US$` → `USD`, `HKD` → `HKD`
- **Language**: `1` → English, `450` → Chinese
- **Categories**: Maps various product categories to `skincare`, `makeup`, or `fragrance`

## Error Handling

The program includes comprehensive error handling for:
- Network errors when fetching from API
- XML parsing errors
- File system errors when saving data
- Invalid product data

## Configuration

You can modify the following in `src/fetchProducts.js`:

- API base URL
- Currency and language mappings
- Category mappings
- Output file path

## Troubleshooting

1. **Network errors**: Check your internet connection and the API endpoint
2. **XML parsing errors**: The API response format may have changed
3. **File permission errors**: Ensure the output directory exists and is writable
4. **Translation issues**: Check if the Chinese API is returning data correctly

## Development

The code is structured with:
- `ProductFetcher` class for handling API calls and data conversion
- Express server for providing REST API endpoints
- Modular design for easy maintenance and extension 