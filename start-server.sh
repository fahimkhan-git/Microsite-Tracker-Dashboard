#!/bin/bash

echo "🧹 Clearing ports..."
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:5001 | xargs kill -9 2>/dev/null
sleep 1

echo "✅ Starting server..."
npm run dev

