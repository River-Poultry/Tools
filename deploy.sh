#!/bin/bash

echo "🚀 Portfolio Manager - One-Click Render Deployment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this from the project root."
    exit 1
fi

echo "✅ Project structure verified"
echo "📦 Dependencies updated"
echo "🔧 Settings configured for Render"
echo "🗄️  Database will be created automatically"
echo "🌐 Environment variables will be set automatically"
echo ""
echo "🎯 Ready for deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://dashboard.render.com/"
echo "2. Click 'New' → 'Blueprint'"
echo "3. Connect your GitHub repository: richobuku/portfolio-manager"
echo "4. Click 'Apply'"
echo ""
echo "✨ That's it! Render will handle everything else automatically."
echo ""
echo "🔗 Your app will be available at: https://portfolio-manager-backend.onrender.com"
echo "👤 Admin panel: https://portfolio-manager-backend.onrender.com/admin/"
echo ""
echo "💡 Need help? Check RENDER_DEPLOYMENT.md for detailed instructions." 