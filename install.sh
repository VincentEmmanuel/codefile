#!/bin/bash

# MCP Code Server Installation Script
# This script automatically sets up MCP Code Server for Claude Desktop

set -e

echo "🚀 MCP Code Server Quick Installer"
echo "=================================="

# Detect OS
OS="unknown"
CONFIG_PATH=""

if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
    CONFIG_PATH="$APPDATA/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
fi

echo "📍 Detected OS: $OS"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Create installation directory
INSTALL_DIR="$HOME/.mcp/mcp-code-server"
echo "📁 Installing to: $INSTALL_DIR"

# Clone or download the repository
if command -v git &> /dev/null; then
    echo "📥 Cloning repository..."
    rm -rf "$INSTALL_DIR"
    git clone https://github.com/VincentEmmanuel/codefile.git "$INSTALL_DIR"
else
    echo "📥 Downloading repository..."
    mkdir -p "$INSTALL_DIR"
    curl -L https://github.com/VincentEmmanuel/codefile/archive/main.tar.gz | tar xz -C "$INSTALL_DIR" --strip-components=1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd "$INSTALL_DIR"
npm install --production

# Configure Claude Desktop
echo "⚙️  Configuring Claude Desktop..."

# Create config directory if it doesn't exist
CONFIG_DIR=$(dirname "$CONFIG_PATH")
mkdir -p "$CONFIG_DIR"

# Backup existing config if it exists
if [ -f "$CONFIG_PATH" ]; then
    cp "$CONFIG_PATH" "$CONFIG_PATH.backup"
    echo "📋 Backed up existing config to: $CONFIG_PATH.backup"
fi

# Update or create config
if [ -f "$CONFIG_PATH" ]; then
    # Config exists, update it
    node -e "
    const fs = require('fs');
    const configPath = '$CONFIG_PATH';
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    config.mcpServers = config.mcpServers || {};
    config.mcpServers['mcp-code-server'] = {
        command: 'node',
        args: ['$INSTALL_DIR/server.js']
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Configuration updated successfully');
    "
else
    # Create new config
    cat > "$CONFIG_PATH" << EOF
{
  "mcpServers": {
    "mcp-code-server": {
      "command": "node",
      "args": ["$INSTALL_DIR/server.js"]
    }
  }
}
EOF
    echo "✅ Configuration created successfully"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Restart Claude Desktop"
echo "2. Look for 'mcp-code-server' in the server list"
echo "3. Start using commands like:"
echo "   - 'Search for TODO comments in my code'"
echo "   - 'Analyze this project structure'"
echo "   - 'Find all async functions'"
echo ""
echo "To uninstall, run:"
echo "  rm -rf $INSTALL_DIR"
echo "  And remove the mcp-code-server entry from $CONFIG_PATH"
