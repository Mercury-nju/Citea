#!/bin/bash

echo "🚀 Setting up Citea - Free Citation Verification Tool"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "To start the development server, run:"
    echo "  npm run dev"
    echo ""
    echo "Then open http://localhost:3000 in your browser"
    echo ""
    echo "Features available:"
    echo "  ✓ AI Source Finder"
    echo "  ✓ Citation Checker"
    echo "  ✓ AI Research Assistant"
    echo ""
    echo "All features are 100% FREE! 🎉"
else
    echo ""
    echo "❌ Installation failed. Please check the errors above."
    exit 1
fi

