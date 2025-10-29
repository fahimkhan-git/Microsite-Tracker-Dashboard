#!/bin/bash

echo "🔍 Checking for processes using port 5000 and 5001..."

# Kill processes on port 5000
PID_5000=$(lsof -ti:5000)
if [ ! -z "$PID_5000" ]; then
    echo "⚠️  Found process on port 5000: $PID_5000"
    echo "   Killing process..."
    kill -9 $PID_5000 2>/dev/null
    sleep 1
    echo "   ✅ Port 5000 is now free"
else
    echo "   ✅ Port 5000 is available"
fi

# Kill processes on port 5001
PID_5001=$(lsof -ti:5001)
if [ ! -z "$PID_5001" ]; then
    echo "⚠️  Found process on port 5001: $PID_5001"
    echo "   Killing process..."
    kill -9 $PID_5001 2>/dev/null
    sleep 1
    echo "   ✅ Port 5001 is now free"
else
    echo "   ✅ Port 5001 is available"
fi

echo ""
echo "✅ Ports are ready. You can now run: npm run dev"

