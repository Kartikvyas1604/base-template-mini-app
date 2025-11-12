#!/bin/bash

# TapMint Connection Test Script
# Run this to verify your setup is working correctly

echo "🧪 TapMint Connection Test"
echo "================================"
echo ""

# Check if running on supported OS
echo "1️⃣ Checking environment..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "✅ OS: Linux (Good for development)"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✅ OS: macOS (Bluetooth supported on Chrome)"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "✅ OS: Windows (Bluetooth supported on Chrome/Edge)"
else
    echo "⚠️  OS: Unknown"
fi
echo ""

# Check if Node.js is installed
echo "2️⃣ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo ""

# Check if dependencies are installed
echo "3️⃣ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules found"
else
    echo "⚠️  node_modules not found. Run: npm install"
fi
echo ""

# Check environment variables
echo "4️⃣ Checking environment..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    
    # Check for important variables
    if grep -q "NEXT_PUBLIC_PINATA_JWT" .env.local; then
        echo "  ✅ Pinata JWT configured"
    else
        echo "  ⚠️  Pinata JWT not found (optional)"
    fi
else
    echo "⚠️  .env.local not found (optional for local dev)"
fi
echo ""

# Check if dev server can start
echo "5️⃣ Testing dev server..."
if npm run build &> /dev/null; then
    echo "✅ Build successful"
else
    echo "⚠️  Build failed. Check for errors."
fi
echo ""

# Browser compatibility check
echo "================================"
echo "📱 Browser Compatibility Check"
echo "================================"
echo ""
echo "Bluetooth Support:"
echo "  ✅ Chrome (Android, Desktop)"
echo "  ✅ Edge (Desktop)"
echo "  ❌ Safari (iOS, macOS)"
echo "  ❌ Firefox"
echo ""
echo "NFC Support:"
echo "  ✅ Chrome (Android only)"
echo "  ❌ All other browsers"
echo ""
echo "QR Code Support:"
echo "  ✅ All modern browsers"
echo ""

# Connection test instructions
echo "================================"
echo "🧪 How to Test Real Connections"
echo "================================"
echo ""
echo "📡 Bluetooth Test:"
echo "  1. Open on Device 1: http://localhost:3000"
echo "  2. Open on Device 2: http://localhost:3000"
echo "  3. Connect wallets on both devices"
echo "  4. Device 1: Connect → Bluetooth → Scan"
echo "  5. Select Device 2 from picker"
echo "  6. Should show real device name"
echo ""
echo "📷 QR Code Test:"
echo "  1. Device 1: Connect → QR → Generate"
echo "  2. Device 2: Connect → QR → Scan"
echo "  3. Point Device 2 camera at Device 1 screen"
echo "  4. Should detect and exchange addresses"
echo ""
echo "📱 NFC Test (Android only):"
echo "  1. Get a physical NFC tag (NTAG213)"
echo "  2. Device 1: Connect → NFC → Write Tag"
echo "  3. Tap phone to NFC tag"
echo "  4. Device 2: Connect → NFC → Read Tag"
echo "  5. Tap phone to same tag"
echo ""

# Final instructions
echo "================================"
echo "🚀 Start Development Server"
echo "================================"
echo ""
echo "Run: npm run dev"
echo "Open: http://localhost:3000"
echo ""
echo "For testing on mobile devices:"
echo "  1. Find your IP: ifconfig (Linux/Mac) or ipconfig (Windows)"
echo "  2. Open on phone: http://YOUR_IP:3000"
echo "  3. Make sure phone is on same WiFi"
echo ""
echo "✨ Ready to test TapMint!"
echo ""
