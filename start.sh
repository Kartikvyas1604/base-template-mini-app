#!/bin/bash

echo "🚀 TapMint - Quick Start"
echo "========================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOL
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_FRAME_NAME=TapMint
NEXT_PUBLIC_FRAME_DESCRIPTION=Connect physically, mint digitally
NEXT_PUBLIC_USE_WALLET=true
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_PINATA_JWT=
NEXT_PUBLIC_PINATA_API_KEY=
NEXT_PUBLIC_PINATA_SECRET_KEY=
EOL
    echo "✅ Created .env.local"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo ""
echo "🎨 Starting development server..."
echo ""
echo "👉 Open http://localhost:3000 in your browser"
echo "👉 Connect your wallet to get started"
echo ""
echo "📚 Read SETUP_GUIDE.md for deployment instructions"
echo "📋 Read PROJECT_SUMMARY.md for feature overview"
echo ""

npm run dev
