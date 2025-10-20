#!/bin/bash

# River Poultry Tools Frontend Deployment Script
# This script builds and deploys the React frontend

set -e  # Exit on any error

echo "🚀 Starting River Poultry Tools Frontend Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Check Node.js version
echo "🔍 Checking Node.js version..."
node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating from example..."
    cp env.example .env
    echo "📝 Please edit .env file with your production values before continuing."
    echo "   nano .env"
    read -p "Press Enter when you've updated the .env file..."
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm ci --only=production

# Run tests
echo "🧪 Running tests..."
npm test -- --watchAll=false --passWithNoTests

# Build the application
echo "🔨 Building the application..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Error: Build failed. No build directory found."
    exit 1
fi

# Optimize build
echo "⚡ Optimizing build..."
# Remove source maps in production
find build -name "*.map" -delete

# Compress static assets (if gzip is available)
if command -v gzip &> /dev/null; then
    echo "🗜️  Compressing static assets..."
    find build -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -k {} \;
fi

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf river-poultry-tools-frontend-$(date +%Y%m%d-%H%M%S).tar.gz build/

echo "✅ Frontend deployment build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Upload the build directory to your web server"
echo "2. Configure your web server to serve the React app"
echo "3. Set up SSL certificates"
echo "4. Configure environment variables on your server"
echo ""
echo "🌐 To serve locally for testing:"
echo "   npx serve -s build -l 3000"
echo ""
echo "📁 Build directory: ./build"
echo "📦 Deployment package: river-poultry-tools-frontend-*.tar.gz"



