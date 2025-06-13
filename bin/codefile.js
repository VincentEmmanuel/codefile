#!/usr/bin/env node

/**
 * Executable wrapper for CodeFile MCP Server
 * This allows the server to be run via npx
 */

import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the path to the actual server.js file
const serverPath = path.join(__dirname, '..', 'server.js');

// Since server.js uses ES modules, we need to run it with Node
// The server.js already has #!/usr/bin/env node shebang
const server = spawn(process.execPath, [serverPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env
});

// Handle process termination
server.on('error', (err) => {
  console.error('Failed to start CodeFile MCP Server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  process.exit(code || 0);
});

// Forward signals to the server
process.on('SIGINT', () => server.kill('SIGINT'));
process.on('SIGTERM', () => server.kill('SIGTERM'));
