#!/bin/bash

echo "🚀 Setting up Microsite Tracker Dashboard..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your Supabase database URL."
    echo ""
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "⚠️  IMPORTANT: Update .env file with your Supabase DATABASE_URL"
echo ""
echo "Next steps:"
echo "1. Update .env with your DATABASE_URL from Supabase"
echo "2. Run: npx prisma migrate dev --name init"
echo "3. Start backend: npm run dev"
echo "4. Start frontend: cd client && npm start"
echo ""

