#!/bin/bash

# River Poultry Tools - Vercel Deployment Script
# This script handles the deployment process for the Tools frontend

set -e

echo "🚀 Starting River Poultry Tools deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the Tools directory."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel first:"
    vercel login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run build to check for errors
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod --yes

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app is now live on Vercel!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Deploy the backend separately (Railway, Render, etc.)"
    echo "2. Update REACT_APP_API_URL with the actual backend URL"
    echo "3. Test the email functionality"
    echo ""
    echo "🔧 To update environment variables:"
    echo "vercel env add REACT_APP_API_URL"
    echo "vercel env add REACT_APP_VAPID_PUBLIC_KEY"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi
