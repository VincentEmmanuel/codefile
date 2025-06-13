#!/usr/bin/env node

/**
 * Enhanced setup script for CodeFile MCP Server
 * Automatically configures Claude Desktop and other MCP clients
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATHS = {
  claude: {
    darwin: path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
    win32: path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json'),
    linux: path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json')
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const isUninstall = args.includes('--uninstall');
const isGlobal = args.includes('--global');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = '') {
  console.log(color + message + colors.reset);
}

function getConfigPath(client = 'claude') {
  const platform = process.platform;
  return CONFIG_PATHS[client]?.[platform];
}

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    return { mcpServers: {} };
  }
  
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`Error reading config file: ${error.message}`, colors.red);
    return { mcpServers: {} };
  }
}

function saveConfig(configPath, config) {
  ensureDirectoryExists(configPath);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function getServerConfig(isGlobal) {
  if (isGlobal) {
    // Global installation via npx
    return {
      command: "npx",
      args: ["-y", "codefile"]
    };
  } else {
    // Local installation
    const serverPath = path.resolve(__dirname, '..', 'server.js');
    return {
      command: "node",
      args: [serverPath]
    };
  }
}

function install() {
  log('\n🚀 CodeFile MCP Server Setup\n', colors.bright + colors.cyan);
  
  const configPath = getConfigPath();
  if (!configPath) {
    log('Unsupported platform', colors.red);
    process.exit(1);
  }
  
  log(`📋 Configuring Claude Desktop...`, colors.yellow);
  
  const config = loadConfig(configPath);
  const serverName = 'codefile';
  
  // Check if already installed
  if (config.mcpServers && config.mcpServers[serverName]) {
    log(`✅ CodeFile is already configured`, colors.green);
    const update = args.includes('--force');
    if (!update) {
      log(`   Use --force to update the configuration`, colors.yellow);
      return;
    }
  }
  
  // Add server configuration
  config.mcpServers = config.mcpServers || {};
  config.mcpServers[serverName] = getServerConfig(isGlobal);
  
  // Save configuration
  saveConfig(configPath, config);
  
  log(`✅ Configuration saved to: ${configPath}`, colors.green);
  log(`\n🎉 Setup complete!`, colors.bright + colors.green);
  log(`\nNext steps:`, colors.cyan);
  log(`1. Restart Claude Desktop`);
  log(`2. Look for "codefile" in Claude's server list`);
  log(`3. Start using commands like:`);
  log(`   - "Search for TODO comments in my code"`);
  log(`   - "Analyze this project structure"`);
  log(`   - "Find all functions containing 'async'"`);
  
  if (!isGlobal) {
    log(`\n💡 Tip: For easier sharing, publish to npm and use --global flag`, colors.yellow);
  }
}

function uninstall() {
  log('\n🔧 Uninstalling CodeFile\n', colors.bright + colors.yellow);
  
  const configPath = getConfigPath();
  if (!configPath) {
    log('Unsupported platform', colors.red);
    process.exit(1);
  }
  
  const config = loadConfig(configPath);
  const serverName = 'codefile';
  
  if (!config.mcpServers || !config.mcpServers[serverName]) {
    log('CodeFile is not installed', colors.yellow);
    return;
  }
  
  delete config.mcpServers[serverName];
  saveConfig(configPath, config);
  
  log(`✅ CodeFile has been removed from Claude Desktop`, colors.green);
  log(`   Restart Claude Desktop to complete the uninstallation`, colors.yellow);
}

// Main execution
if (isUninstall) {
  uninstall();
} else {
  install();
}
