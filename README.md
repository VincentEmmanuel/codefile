# CodeFile

[![npm version](https://img.shields.io/npm/v/codefile.svg)](https://www.npmjs.com/package/codefile)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Model Context Protocol (MCP) server that gives AI assistants comprehensive access to your codebase. Perform file operations, search code, analyze projects, and execute development tasks seamlessly through Claude or other MCP-compatible clients.

## 🚀 Quick Installation

### Option 1: npm (Recommended)

**Automatic Setup:**
```bash
npx codefile setup
```

**Manual Configuration:**
Add to your Claude Desktop config:
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

### Option 2: Manual Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VincentEmmanuel/codefile.git
   cd codefile
   npm install
   ```

2. Add to your Claude Desktop config:
   ```json
   {
     "mcpServers": {
       "codefile": {
         "command": "node",
         "args": ["/path/to/codefile/server.js"]
       }
     }
   }
   ```

## Features

### 1. Filesystem Operations
- **read_file** - Read file contents
- **write_file** - Create or overwrite files
- **edit_file** - Replace text in files
- **create_directory** - Create directories
- **list_directory** - List directory contents with metadata
- **move_file** - Move or rename files/directories
- **delete_file** - Delete files or directories
- **search_files** - Find files by name pattern
- **get_file_info** - Get detailed file metadata

### 2. Code Search
- **search_code** - Search for patterns across code files
  - Supports regex and literal search
  - Case sensitive/insensitive options
  - Context lines around matches
  - Configurable file extensions

### 3. Project Analysis
- **analyze_project_structure** - Comprehensive project analysis
  - Detects project type (Node.js, Python, Rust, Go, etc.)
  - Finds entry points
  - Categorizes directories (source, tests, docs, etc.)
  - Extracts dependencies
  - Provides file statistics

### 4. Utilities
- **execute_command** - Run shell commands
- **parse_json** - Parse and validate JSON
- **parse_yaml** - Parse and validate YAML
- **calculate_hash** - Calculate file hashes (MD5, SHA256, etc.)
- **encode_decode** - Convert between encodings

## Installation

1. Clone or download this repository to `C:\MCP\MCP-Code`

2. Install dependencies:
```bash
cd C:\MCP\MCP-Code
npm install
```

## Configuration

### For Claude Desktop

Add this to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-code": {
      "command": "node",
      "args": ["C:\\MCP\\MCP-Code\\server.js"],
      "env": {}
    }
  }
}
```

### For Other MCP Clients

Use the following command to start the server:
```bash
node C:\MCP\MCP-Code\server.js
```

## Usage Examples

### Code Search
Search for TODO comments in your project:
```
search_code(query="TODO", caseSensitive=false)
```

Search using regex:
```
search_code(query="function\\s+\\w+\\s*\\(", regex=true, fileExtensions=[".js", ".ts"])
```

### Project Analysis
Analyze current project:
```
analyze_project_structure(projectPath=".")
```

### File Operations
Read a file:
```
read_file(path="package.json")
```

Edit a file:
```
edit_file(path="config.js", oldText="debug: false", newText="debug: true")
```

### Utilities
Execute a command:
```
execute_command(command="npm list", cwd="./my-project")
```

Calculate file hash:
```
calculate_hash(path="important-file.zip", algorithm="sha256")
```

## Security Notes

- The server normalizes and validates all file paths
- Binary files are automatically skipped during code search
- Command execution has a 30-second timeout by default
- Large directories are searched with depth limits

## Development

To run in development mode with auto-reload:
```bash
npm run dev
```

## Error Handling

All tools return structured responses with error information when operations fail:
```json
{
  "error": "Detailed error message"
}
```

## Performance Tips

1. Use specific file extensions in `search_code` to improve performance
2. Set reasonable `maxResults` limits for search operations
3. The server automatically ignores `node_modules` and `.git` directories
4. Use targeted search paths instead of searching from root

## License

MIT

## Contributing

Feel free to submit issues or pull requests to improve the server functionality.