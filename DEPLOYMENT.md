# Aiora WebAPI - Vercel Deployment Guide

This guide explains how to deploy the Aiora WebAPI to Vercel.

## Prerequisites

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Make sure you have a Vercel account (sign up at https://vercel.com)

## Deployment Steps

### 1. Prepare the Project

Ensure all files are committed to git:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
```

### 2. Deploy to Vercel

From the Aiora-WebAPI directory:
```bash
vercel
```

Follow the prompts:
- Link to existing project or create new one
- Set project name (e.g., `aiora-webapi`)
- Confirm deployment settings

### 3. Set Environment Variables (Optional)

If you need to set environment variables:
```bash
vercel env add NODE_ENV production
```

### 4. Update WebApp Configuration

After deployment, Vercel will provide a URL like `https://your-project.vercel.app`.

Update the WebApp's environment variable:
```bash
# In Aiora-WebApp directory
echo "REACT_APP_API_URL=https://your-project.vercel.app/api" > .env
```

Or set it in your deployment environment.

## Configuration Files

### vercel.json
- Routes all `/api/*` requests to the Express app
- Uses `@vercel/node` runtime
- Sets production environment

### .vercelignore
- Excludes unnecessary files from deployment
- Reduces deployment size and time

## API Endpoints

After deployment, your API will be available at:
- `https://your-project.vercel.app/api/products`
- `https://your-project.vercel.app/api/categories`
- `https://your-project.vercel.app/api/products/:id`
- `https://your-project.vercel.app/api/products/category/:category`

## Important Notes

1. **File System**: Vercel uses a read-only file system, so the `data/products.json` file needs to be included in the deployment.

2. **Cold Starts**: Serverless functions may have cold start delays on first request.

3. **Timeout**: Vercel has a 10-second timeout for serverless functions.

4. **Admin Endpoint**: The `/api/admin/fetch-products` endpoint may not work in production due to file system limitations.

## Troubleshooting

### Common Issues:

1. **Build Errors**: Check that all dependencies are in `package.json`
2. **Runtime Errors**: Check Vercel function logs in the dashboard
3. **CORS Issues**: The API includes CORS middleware for cross-origin requests
4. **File Not Found**: Ensure `data/products.json` exists and is included in deployment

### Checking Logs:
```bash
vercel logs
```

### Redeploying:
```bash
vercel --prod
```

## Local Development

For local development, the API still works as before:
```bash
npm start
```

The API will run on `http://localhost:3001` for local development. 