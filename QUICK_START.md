# Quick Start Guide for MCP Code Server

## Installation Steps

### 1. Install Dependencies
Open a terminal in this directory (`C:\MCP\MCP-Code`) and run:
```bash
npm install
```

### 2. Configure Claude Desktop

The configuration file location depends on your operating system:

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Copy the contents of `claude_desktop_config_example.json` to the configuration file.

### 3. Restart Claude Desktop

After saving the configuration, restart Claude Desktop for the changes to take effect.

## Testing the Server

You can test the server standalone by running:
```bash
node server.js
```

The server should start and display:
```
mcp-code-server v1.0.0 running on stdio
```

Press Ctrl+C to stop the server.

## Available Tools

Once configured, you can use these tools in Claude:

1. **File Operations**: read_file, write_file, edit_file, etc.
2. **Code Search**: search_code with regex support
3. **Project Analysis**: analyze_project_structure
4. **Utilities**: execute_command, parse_json, calculate_hash, etc.

## Example Usage in Claude

After setup, you can ask Claude to:
- "Search for all TODO comments in this project"
- "Analyze the structure of my Node.js project"
- "Find all functions that contain 'async'"
- "Calculate the SHA256 hash of package.json"

## Troubleshooting

1. **Server not appearing in Claude**: Check the configuration file path and JSON syntax
2. **Permission errors**: Ensure the server has read/write access to target directories
3. **Module not found**: Run `npm install` to install dependencies

For more information, see the README.md file.
