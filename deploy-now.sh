#!/bin/bash

echo "🚀 PORTFOLIO MANAGER - AUTOMATED DEPLOYMENT"
echo "=========================================="
echo ""
echo "📋 Follow these 3 simple steps:"
echo ""
echo "1️⃣  Go to: https://dashboard.render.com/"
echo "2️⃣  Follow the copy-paste instructions in AUTO_DEPLOY.md"
echo "3️⃣  Your app will be live in ~10 minutes!"
echo ""
echo "📖 Opening deployment guide..."
echo ""

# Open the deployment guide
if command -v open >/dev/null 2>&1; then
    open AUTO_DEPLOY.md
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open AUTO_DEPLOY.md
else
    echo "📄 Deployment guide: AUTO_DEPLOY.md"
fi

echo ""
echo "🎯 Ready to deploy? Just follow the guide!"
echo "🆘 Need help? I'm here to assist you!" 