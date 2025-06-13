# CodeFile - MCP Server for Code Operations

A powerful Model Context Protocol (MCP) server that provides comprehensive code operations, filesystem management, and project analysis capabilities to Claude Desktop and other MCP clients.

## Features

### 🗂️ Filesystem Operations
- **Read/Write Files** - Read, create, and modify files
- **Directory Management** - Create, list, and navigate directories  
- **File Operations** - Move, rename, delete files and directories
- **Search Files** - Find files by name pattern with glob support

### 🔍 Code Intelligence
- **Code Search** - Search across codebases with regex support
- **Context-Aware Results** - Get surrounding lines for better context
- **Multi-Language Support** - Works with all major programming languages
- **Project Analysis** - Understand project structure and dependencies

### 🛠️ Developer Utilities
- **Command Execution** - Run shell commands with timeout protection
- **Data Processing** - Parse JSON/YAML, calculate hashes, encode/decode
- **Project Insights** - Analyze dependencies, find entry points, categorize directories

## Quick Start

### Installation via npx (Recommended)

1. **Configure Claude Desktop**

Add to your Claude Desktop config:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "codefile": {
      "command": "npx",
      "args": ["-y", "codefile"]
    }
  }
}
```

2. **Restart Claude Desktop**

3. **Start using!** Ask Claude to:
   - "Search for TODO comments in my code"
   - "Analyze this project structure"
   - "Find all functions containing 'async'"

### Automatic Setup

```bash
npx codefile-setup
```

This will automatically configure Claude Desktop for you.

## Available Tools

### File Operations
- `read_file` - Read file contents
- `write_file` - Write content to file
- `edit_file` - Replace text in files
- `create_directory` - Create directories
- `list_directory` - List directory contents
- `move_file` - Move or rename files
- `delete_file` - Delete files or directories
- `search_files` - Search for files by pattern
- `get_file_info` - Get file metadata

### Code Intelligence
- `search_code` - Search for code patterns
- `analyze_project_structure` - Analyze project organization

### Utilities
- `execute_command` - Run shell commands
- `parse_json` - Parse JSON data
- `parse_yaml` - Parse YAML data
- `calculate_hash` - Calculate file hashes
- `encode_decode` - Convert between encodings

## Examples

### Search for patterns in code
```
Claude: "Find all TODO comments in JavaScript files"
```

### Analyze project
```
Claude: "What kind of project is this and what are its dependencies?"
```

### Refactor code
```
Claude: "Replace all console.log statements with logger.debug"
```

## Security

- Path validation and normalization
- Automatic filtering of sensitive directories (.git, node_modules)
- Command execution timeouts
- No arbitrary code execution

## Requirements

- Node.js 18.0.0 or higher
- Claude Desktop or any MCP-compatible client

## License

MIT

## Author

Vincent Emmanuel <vincent_emmanuel@ymail.com>

## Repository

[https://github.com/VincentEmmanuel/codefile](https://github.com/VincentEmmanuel/codefile)
