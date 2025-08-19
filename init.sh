#!/bin/bash

echo "🚀 MultiAgent Claude Quick Initializer"
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

if ! command -v claude &> /dev/null; then
    echo "⚠️  Claude CLI not found. Installing..."
    npm install -g @anthropic-ai/claude-cli
fi

echo "Select initialization type:"
echo "1) Standard multi-agent setup"
echo "2) Memory-focused setup"
echo "3) Setup with documentation import"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        node cli/index.js init
        ;;
    2)
        node cli/index.js init --memory-only
        ;;
    3)
        node cli/index.js init --with-docs
        ;;
    *)
        echo "Invalid choice. Running standard setup..."
        node cli/index.js init
        ;;
esac