#!/bin/bash

# Operational Communication Hub - Start Script
# This script starts both the backend and frontend servers

echo "═══════════════════════════════════════════════════════"
echo "   Starting Operational Communication Hub"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "⚠️  Dependencies not installed. Installing..."
    npm run install-all
    echo ""
fi

# Start both servers
echo "🚀 Starting servers..."
echo ""
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "   Press Ctrl+C to stop both servers"
echo ""

npm start

