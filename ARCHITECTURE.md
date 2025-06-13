# MCP Code Server - Architecture & Workflow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           User's Computer                            │
│                                                                      │
│  ┌─────────────────┐         ┌──────────────────────────────────┐  │
│  │                 │         │         MCP Code Server          │  │
│  │  Claude Desktop │◄────────┤                                  │  │
│  │                 │   MCP   │  ┌────────────────────────────┐  │  │
│  └─────────────────┘         │  │     Tool Handlers          │  │  │
│          ▲                   │  ├────────────────────────────┤  │  │
│          │                   │  │ • read_file               │  │  │
│          │                   │  │ • write_file              │  │  │
│          ▼                   │  │ • search_code             │  │  │
│  ┌─────────────────┐         │  │ • analyze_project         │  │  │
│  │                 │         │  │ • execute_command         │  │  │
│  │      User       │         │  │ • ... and more            │  │  │
│  │                 │         │  └────────────────────────────┘  │  │
│  └─────────────────┘         │           │                      │  │
│                              │           ▼                      │  │
│                              │  ┌────────────────────────────┐  │  │
│                              │  │    File System Access      │  │  │
│                              │  └────────────────────────────┘  │  │
│                              └──────────────┬───────────────────┘  │
│                                            │                       │
│                                            ▼                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                        Your Codebase                           │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │ │
│  │  │   src/   │  │  tests/ │  │  docs/  │  │  package.json   │  │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Workflow Examples

### Example 1: Code Search Workflow
```
1. User Request
   └─> "Find all TODO comments in my JavaScript files"

2. Claude Interprets
   └─> Calls search_code(query="TODO", fileExtensions=[".js"])

3. MCP Server Processes
   ├─> Validates parameters
   ├─> Scans file system
   ├─> Applies search pattern
   └─> Collects results with context

4. Results Returned
   └─> Claude receives structured data:
       [
         {
           "file": "src/app.js",
           "line": 42,
           "match": "// TODO: Add error handling",
           "context": [...]
         },
         ...
       ]

5. Claude Responds
   └─> "I found 7 TODO comments in your JavaScript files..."
```

### Example 2: Project Analysis Workflow
```
1. User: "What kind of project is this?"
   │
   ▼
2. Claude → analyze_project_structure()
   │
   ▼
3. MCP Server:
   ├─> Detects package.json → "Node.js project"
   ├─> Finds entry points → ["index.js", "server.js"]
   ├─> Categorizes folders → {src, tests, docs}
   ├─> Extracts dependencies → {express, jest, ...}
   └─> Calculates statistics → {files: 150, size: 2.3MB}
   │
   ▼
4. Claude: "This is a Node.js web application using Express..."
```

## Data Flow

```
┌─────────┐      Natural       ┌─────────┐      JSON-RPC      ┌─────────┐
│         │     Language       │         │        over        │         │
│  User   │ ───────────────►  │ Claude  │ ◄───────────────► │   MCP   │
│         │ ◄───────────────   │         │                    │ Server  │
└─────────┘    Response        └─────────┘                    └─────────┘
                                    │                               │
                                    │                               │
                                    └──────── Tool Calls ──────────┘
                                              (via MCP)
```

## Security Model

```
┌──────────────────────────────────────────┐
│          Security Layers                  │
├──────────────────────────────────────────┤
│ 1. Path Validation                       │
│    └─> Normalizes and validates paths    │
├──────────────────────────────────────────┤
│ 2. Access Control                        │
│    └─> No access outside project root    │
├──────────────────────────────────────────┤
│ 3. Command Timeouts                      │
│    └─> 30-second default timeout         │
├──────────────────────────────────────────┤
│ 4. Ignore Patterns                       │
│    └─> Skip .git, node_modules, etc.    │
├──────────────────────────────────────────┤
│ 5. Safe Operations                       │
│    └─> No arbitrary code execution       │
└──────────────────────────────────────────┘
```

## Tool Categories

```
MCP Code Server Tools
│
├── 📁 Filesystem Operations
│   ├── read_file
│   ├── write_file
│   ├── edit_file
│   ├── create_directory
│   ├── list_directory
│   ├── move_file
│   ├── delete_file
│   ├── search_files
│   └── get_file_info
│
├── 🔍 Code Intelligence
│   ├── search_code
│   └── analyze_project_structure
│
└── 🛠️ Utilities
    ├── execute_command
    ├── parse_json
    ├── parse_yaml
    ├── calculate_hash
    └── encode_decode
```

## Performance Characteristics

```
Operation               Typical Time    Scales With
─────────────────────────────────────────────────
read_file              < 10ms          File size
write_file             < 50ms          File size
search_code            100ms-5s        Project size
analyze_project        200ms-2s        Project complexity
execute_command        Variable        Command complexity
```

## Integration Points

```
┌─────────────────┐
│  Claude Desktop │──┐
└─────────────────┘  │
                     ├──► MCP Code Server ──► Your Projects
┌─────────────────┐  │
│  Other MCP      │──┘
│  Clients        │
└─────────────────┘
```

---

*This architecture enables Claude to work with your code as naturally as you do, but with AI-powered speed and intelligence.*