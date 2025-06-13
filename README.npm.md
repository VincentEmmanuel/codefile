# CodeFile

A powerful Model Context Protocol (MCP) server that gives AI assistants comprehensive access to your codebase. Perform file operations, search code, analyze projects, and execute development tasks seamlessly through Claude or other MCP-compatible clients.

## 🚀 Quick Start

### Option 1: Automatic Setup (Recommended)
```bash
npx codefile setup
```

This automatically configures Claude Desktop to use CodeFile.

### Option 2: Manual Configuration
Add this to your Claude Desktop config:

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

### Option 3: Use Without Installation
```bash
npx codefile
```

## 📦 Features

- **🔍 Smart Code Search**: Search across codebases with regex support
- **📁 File Operations**: Read, write, edit, move, and delete files
- **🏗️ Project Analysis**: Automatically detect project types and structure
- **💻 Command Execution**: Run shell commands with timeout protection
- **🛠️ Developer Utilities**: Parse JSON/YAML, calculate hashes, encode/decode

## 🎯 Usage Examples

Once configured, you can ask Claude:

- "Search for all TODO comments in this project"
- "Analyze the structure of my Node.js project"
- "Find all async functions in the codebase"
- "Calculate the SHA256 hash of package.json"
- "Show me the largest files in this project"

## 🔧 Available Tools

### File Operations
- `read_file` - Read file contents
- `write_file` - Create or overwrite files
- `edit_file` - Replace text in files
- `create_directory` - Create directories
- `list_directory` - List directory contents
- `move_file` - Move or rename files
- `delete_file` - Delete files or directories
- `search_files` - Find files by pattern
- `get_file_info` - Get detailed file metadata

### Code Intelligence
- `search_code` - Search for patterns across code
- `analyze_project_structure` - Comprehensive project analysis

### Utilities
- `execute_command` - Run shell commands
- `parse_json` - Parse and validate JSON
- `parse_yaml` - Parse and validate YAML
- `calculate_hash` - Calculate file hashes
- `encode_decode` - Convert between encodings

## 🔒 Security

- Path validation and normalization
- Controlled file system access
- Command execution timeouts
- Automatic filtering of sensitive directories

## 📋 Requirements

- Node.js >= 18.0.0
- Claude Desktop app

## 🚪 Uninstall

```bash
npx codefile setup --uninstall
```

## 📝 License

MIT

## 🤝 Contributing

Issues and pull requests are welcome!

---

Made with ❤️ for developers using AI assistants
