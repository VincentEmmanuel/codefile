#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import yaml from 'js-yaml';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Server name and version
const SERVER_NAME = 'codefile';
const SERVER_VERSION = '1.0.0';

// Helper function to ensure path safety
function ensureSafePath(requestedPath) {
  const normalizedPath = path.normalize(requestedPath);
  const resolvedPath = path.resolve(normalizedPath);
  // You can add additional path validation here
  return resolvedPath;
}

// Helper function to convert paths for glob (cross-platform)
function toGlobPath(pathStr) {
  // Convert Windows backslashes to forward slashes for glob
  // This works on all platforms: forward slashes work on Windows too
  return pathStr.replace(/\\/g, '/');
}

// Initialize MCP server
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool handlers
const toolHandlers = {
  // Filesystem operations
  read_file: async ({ path: filePath, encoding = 'utf-8' }) => {
    console.error('\n🔍 READ_FILE called with:', { filePath, encoding });
    try {
      const safePath = ensureSafePath(filePath);
      console.error('  ✓ Safe path:', safePath);
      const content = await fs.readFile(safePath, encoding);
      console.error('  ✓ File read successfully, size:', content.length, 'bytes');
      return { content };
    } catch (error) {
      console.error('  ❌ Error reading file:', error.message);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  },

  write_file: async ({ path: filePath, content }) => {
    console.error('\n📝 WRITE_FILE called with:', { filePath, contentLength: content.length });
    try {
      const safePath = ensureSafePath(filePath);
      console.error('  ✓ Safe path:', safePath);
      await fs.writeFile(safePath, content, 'utf-8');
      console.error('  ✓ File written successfully');
      return { success: true, message: `File written successfully: ${filePath}` };
    } catch (error) {
      console.error('  ❌ Error writing file:', error.message);
      throw new Error(`Failed to write file: ${error.message}`);
    }
  },

  edit_file: async ({ path: filePath, oldText, newText }) => {
    console.error('\n✏️ EDIT_FILE called with:', { 
      filePath, 
      oldTextLength: oldText.length, 
      newTextLength: newText.length 
    });
    try {
      const safePath = ensureSafePath(filePath);
      console.error('  ✓ Safe path:', safePath);
      const content = await fs.readFile(safePath, 'utf-8');
      console.error('  ✓ File read, size:', content.length, 'bytes');
      
      if (!content.includes(oldText)) {
        console.error('  ❌ Text to replace not found in file');
        throw new Error('Text to replace not found in file');
      }
      
      const newContent = content.replace(oldText, newText);
      console.error('  ✓ Text replaced, new size:', newContent.length, 'bytes');
      await fs.writeFile(safePath, newContent, 'utf-8');
      console.error('  ✓ File saved successfully');
      
      return { 
        success: true, 
        message: 'File edited successfully',
        changes: { old: oldText, new: newText }
      };
    } catch (error) {
      console.error('  ❌ Error editing file:', error.message);
      throw new Error(`Failed to edit file: ${error.message}`);
    }
  },

  create_directory: async ({ path: dirPath }) => {
    console.error('\n📁 CREATE_DIRECTORY called with:', { dirPath });
    try {
      const safePath = ensureSafePath(dirPath);
      console.error('  ✓ Safe path:', safePath);
      await fs.mkdir(safePath, { recursive: true });
      console.error('  ✓ Directory created successfully');
      return { success: true, message: `Directory created: ${dirPath}` };
    } catch (error) {
      console.error('  ❌ Error creating directory:', error.message);
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  },

  list_directory: async ({ path: dirPath = '.' }) => {
    console.error('\n📂 LIST_DIRECTORY called with:', { dirPath });
    try {
      const safePath = ensureSafePath(dirPath);
      console.error('  ✓ Safe path:', safePath);
      const items = await fs.readdir(safePath, { withFileTypes: true });
      console.error('  ✓ Found', items.length, 'items');
      
      const results = await Promise.all(
        items.map(async (item) => {
          const itemPath = path.join(safePath, item.name);
          const stats = await fs.stat(itemPath);
          
          return {
            name: item.name,
            path: itemPath,
            type: item.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            modified: stats.mtime.toISOString(),
            extension: item.isFile() ? path.extname(item.name) : null
          };
        })
      );
      
      console.error('  ✓ Successfully processed all items');
      return { items: results };
    } catch (error) {
      console.error('  ❌ Error listing directory:', error.message);
      throw new Error(`Failed to list directory: ${error.message}`);
    }
  },

  move_file: async ({ source, destination }) => {
    try {
      const safeSrc = ensureSafePath(source);
      const safeDest = ensureSafePath(destination);
      await fs.rename(safeSrc, safeDest);
      return { success: true, message: `Moved ${source} to ${destination}` };
    } catch (error) {
      throw new Error(`Failed to move file: ${error.message}`);
    }
  },

  delete_file: async ({ path: filePath }) => {
    try {
      const safePath = ensureSafePath(filePath);
      
      // Use fs.rm() which handles both files and directories correctly
      await fs.rm(safePath, { recursive: true, force: true });
      
      return { success: true, message: `Deleted: ${filePath}` };
    } catch (error) {
      throw new Error(`Failed to delete: ${error.message}`);
    }
  },

  search_files: async ({ pattern, searchPath = '.', maxResults = 100 }) => {
    try {
      const safePath = ensureSafePath(searchPath);
      const globPattern = toGlobPath(path.join(safePath, '**', `*${pattern}*`));
      const files = await glob(globPattern, { 
        ignore: ['**/node_modules/**', '**/.git/**'],
        maxDepth: 10
      });
      
      return { 
        files: files.slice(0, maxResults),
        totalFound: files.length,
        truncated: files.length > maxResults
      };
    } catch (error) {
      throw new Error(`Failed to search files: ${error.message}`);
    }
  },

  get_file_info: async ({ path: filePath }) => {
    try {
      const safePath = ensureSafePath(filePath);
      const stats = await fs.stat(safePath);
      
      return {
        path: filePath,
        size: stats.size,
        sizeHuman: formatBytes(stats.size),
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        accessed: stats.atime.toISOString(),
        permissions: stats.mode.toString(8).slice(-3),
        extension: stats.isFile() ? path.extname(filePath) : null
      };
    } catch (error) {
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  },

  // Code search
  search_code: async ({ 
    query, 
    searchPath = '.', 
    fileExtensions = null,
    regex = false,
    caseSensitive = true,
    maxResults = 100 
  }) => {
    console.error('\n🔎 SEARCH_CODE called with:', { 
      query, 
      searchPath, 
      fileExtensions,
      regex,
      caseSensitive,
      maxResults 
    });
    try {
      const safePath = ensureSafePath(searchPath);
      console.error('  ✓ Safe path:', safePath);
      
      // Default code extensions
      const extensions = fileExtensions || [
        '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c',
        '.go', '.rs', '.rb', '.php', '.cs', '.swift', '.kt', '.scala',
        '.r', '.m', '.h', '.sh', '.ps1', '.sql', '.html', '.css'
      ];
      console.error('  ✓ Searching extensions:', extensions.length, 'types');
      
      // Build glob pattern
      const globPattern = extensions.length > 0 
        ? `**/*{${extensions.join(',')}}` 
        : '**/*';
      
      const files = await glob(toGlobPath(path.join(safePath, globPattern)), {
        ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
        maxDepth: 10
      });
      console.error('  ✓ Found', files.length, 'files to search');
      
      const results = [];
      const searchRegex = regex 
        ? new RegExp(query, caseSensitive ? 'g' : 'gi')
        : new RegExp(escapeRegex(query), caseSensitive ? 'g' : 'gi');
      
      for (const file of files) {
        if (results.length >= maxResults) break;
        
        try {
          const content = await fs.readFile(file, 'utf-8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            if (searchRegex.test(line) && results.length < maxResults) {
              const startLine = Math.max(0, index - 2);
              const endLine = Math.min(lines.length - 1, index + 2);
              const context = lines.slice(startLine, endLine + 1);
              
              results.push({
                file: path.relative(safePath, file),
                line: index + 1,
                column: line.search(searchRegex) + 1,
                match: line.trim(),
                context: context.map((l, i) => ({
                  line: startLine + i + 1,
                  content: l,
                  isMatch: startLine + i === index
                }))
              });
            }
          });
        } catch (err) {
          // Skip binary files or files that can't be read
          continue;
        }
      }
      
      console.error('  ✓ Found', results.length, 'matches');
      return {
        results,
        totalMatches: results.length,
        searchedFiles: files.length
      };
    } catch (error) {
      console.error('  ❌ Error searching code:', error.message);
      throw new Error(`Failed to search code: ${error.message}`);
    }
  },

  // Project analysis
  analyze_project_structure: async ({ projectPath = '.' }) => {
    console.error('\n🏗️ ANALYZE_PROJECT_STRUCTURE called with:', { projectPath });
    try {
      const safePath = ensureSafePath(projectPath);
      console.error('  ✓ Safe path:', safePath);
      
      // Detect project type
      console.error('  🔍 Detecting project type...');
      const projectType = await detectProjectType(safePath);
      console.error('  ✓ Project type:', projectType);
      
      // Find entry points
      console.error('  🔍 Finding entry points...');
      const entryPoints = await findEntryPoints(safePath, projectType);
      console.error('  ✓ Found', entryPoints.length, 'entry points');
      
      // Categorize directories
      console.error('  🔍 Categorizing directories...');
      const directories = await categorizeDirectories(safePath);
      console.error('  ✓ Categorized directories');
      
      // Find config files
      console.error('  🔍 Finding config files...');
      const configFiles = await findConfigFiles(safePath);
      console.error('  ✓ Found', configFiles.length, 'config files');
      
      // Extract dependencies
      console.error('  🔍 Extracting dependencies...');
      const dependencies = await extractDependencies(safePath, projectType);
      console.error('  ✓ Dependencies extracted');
      
      // Calculate statistics
      console.error('  🔍 Calculating project statistics...');
      const stats = await calculateProjectStats(safePath);
      console.error('  ✓ Statistics calculated');
      
      return {
        projectType,
        entryPoints,
        directories,
        configFiles,
        dependencies,
        statistics: stats
      };
    } catch (error) {
      console.error('  ❌ Error analyzing project:', error.message);
      throw new Error(`Failed to analyze project: ${error.message}`);
    }
  },

  // Utilities
  execute_command: async ({ command, cwd = '.', timeout = 30000 }) => {
    console.error('\n⚡ EXECUTE_COMMAND called with:', { command, cwd, timeout });
    try {
      const safeCwd = ensureSafePath(cwd);
      console.error('  ✓ Safe working directory:', safeCwd);
      console.error('  🏃 Executing command...');
      const { stdout, stderr } = await execAsync(command, {
        cwd: safeCwd,
        timeout
      });
      
      console.error('  ✓ Command executed successfully');
      if (stdout) console.error('  📤 Stdout length:', stdout.length, 'chars');
      if (stderr) console.error('  ⚠️  Stderr length:', stderr.length, 'chars');
      
      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      };
    } catch (error) {
      console.error('  ❌ Command failed:', error.message);
      return {
        success: false,
        error: error.message,
        stdout: error.stdout?.trim() || '',
        stderr: error.stderr?.trim() || '',
        code: error.code
      };
    }
  },

  parse_json: async ({ content }) => {
    try {
      const parsed = JSON.parse(content);
      return { 
        success: true, 
        data: parsed,
        type: Array.isArray(parsed) ? 'array' : typeof parsed
      };
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  },

  parse_yaml: async ({ content }) => {
    try {
      const parsed = yaml.load(content);
      return { 
        success: true, 
        data: parsed,
        type: Array.isArray(parsed) ? 'array' : typeof parsed
      };
    } catch (error) {
      throw new Error(`Invalid YAML: ${error.message}`);
    }
  },

  calculate_hash: async ({ path: filePath, algorithm = 'sha256' }) => {
    try {
      const safePath = ensureSafePath(filePath);
      const content = await fs.readFile(safePath);
      const hash = crypto.createHash(algorithm);
      hash.update(content);
      
      return {
        algorithm,
        hash: hash.digest('hex'),
        file: filePath
      };
    } catch (error) {
      throw new Error(`Failed to calculate hash: ${error.message}`);
    }
  },

  encode_decode: async ({ content, from = 'utf-8', to = 'base64' }) => {
    try {
      let result;
      
      if (from === 'base64' && to === 'utf-8') {
        result = Buffer.from(content, 'base64').toString('utf-8');
      } else if (from === 'utf-8' && to === 'base64') {
        result = Buffer.from(content, 'utf-8').toString('base64');
      } else {
        // Handle other encoding conversions
        const buffer = Buffer.from(content, from);
        result = buffer.toString(to);
      }
      
      return { 
        success: true, 
        result,
        from,
        to
      };
    } catch (error) {
      throw new Error(`Failed to encode/decode: ${error.message}`);
    }
  }
};

// Helper functions
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function detectProjectType(projectPath) {
  const checks = [
    { file: 'package.json', type: 'node' },
    { file: 'pyproject.toml', type: 'python' },
    { file: 'setup.py', type: 'python' },
    { file: 'requirements.txt', type: 'python' },
    { file: 'Cargo.toml', type: 'rust' },
    { file: 'go.mod', type: 'go' },
    { file: 'pom.xml', type: 'java' },
    { file: 'build.gradle', type: 'java' },
    { file: 'composer.json', type: 'php' },
    { file: 'Gemfile', type: 'ruby' },
    { file: '*.csproj', type: 'dotnet' },
    { file: 'pubspec.yaml', type: 'dart' },
    { file: 'mix.exs', type: 'elixir' }
  ];
  
  for (const check of checks) {
    try {
      if (check.file.includes('*')) {
        const files = await glob(toGlobPath(path.join(projectPath, check.file)));
        if (files.length > 0) return check.type;
      } else {
        await fs.access(path.join(projectPath, check.file));
        return check.type;
      }
    } catch {
      continue;
    }
  }
  
  return 'unknown';
}

async function findEntryPoints(projectPath, projectType) {
  const entryPoints = [];
  
  const patterns = {
    node: ['index.js', 'app.js', 'server.js', 'main.js', 'src/index.js'],
    python: ['main.py', '__main__.py', 'app.py', 'run.py', 'manage.py'],
    rust: ['src/main.rs', 'src/lib.rs'],
    go: ['main.go', 'cmd/*/main.go'],
    java: ['**/Main.java', '**/Application.java'],
    unknown: ['index.*', 'main.*', 'app.*']
  };
  
  const searchPatterns = patterns[projectType] || patterns.unknown;
  
  for (const pattern of searchPatterns) {
    if (pattern.includes('*')) {
      const files = await glob(toGlobPath(path.join(projectPath, pattern)));
      entryPoints.push(...files.map(f => path.relative(projectPath, f)));
    } else {
      try {
        await fs.access(path.join(projectPath, pattern));
        entryPoints.push(pattern);
      } catch {
        continue;
      }
    }
  }
  
  // Also check package.json for Node projects
  if (projectType === 'node') {
    try {
      const pkgPath = path.join(projectPath, 'package.json');
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
      if (pkg.main) entryPoints.push(pkg.main);
      if (pkg.bin) {
        Object.values(pkg.bin).forEach(bin => entryPoints.push(bin));
      }
    } catch {
      // Ignore errors
    }
  }
  
  return [...new Set(entryPoints)]; // Remove duplicates
}

async function categorizeDirectories(projectPath) {
  const categories = {
    source: [],
    tests: [],
    docs: [],
    config: [],
    assets: [],
    build: []
  };
  
  const items = await fs.readdir(projectPath, { withFileTypes: true });
  
  for (const item of items) {
    if (item.isDirectory()) {
      const name = item.name.toLowerCase();
      
      if (['src', 'lib', 'source', 'app', 'core'].includes(name)) {
        categories.source.push(item.name);
      } else if (['test', 'tests', 'spec', 'specs', '__tests__', 'testing'].includes(name)) {
        categories.tests.push(item.name);
      } else if (['docs', 'doc', 'documentation'].includes(name)) {
        categories.docs.push(item.name);
      } else if (['config', 'conf', '.config', 'settings'].includes(name)) {
        categories.config.push(item.name);
      } else if (['assets', 'static', 'public', 'resources', 'media'].includes(name)) {
        categories.assets.push(item.name);
      } else if (['build', 'dist', 'out', 'target', 'bin'].includes(name)) {
        categories.build.push(item.name);
      }
    }
  }
  
  return categories;
}

async function findConfigFiles(projectPath) {
  const configPatterns = [
    '*.json', '*.yaml', '*.yml', '*.toml', '*.ini', '*.conf',
    '.env', '.env.*', '.*rc', '.*rc.js', '.*rc.json', '.*config.js',
    'config/*', 'conf/*', 'settings/*'
  ];
  
  const configFiles = [];
  
  for (const pattern of configPatterns) {
    const files = await glob(toGlobPath(path.join(projectPath, pattern)), {
      ignore: ['**/node_modules/**', '**/.git/**'],
      maxDepth: 3
    });
    
    configFiles.push(...files.map(f => path.relative(projectPath, f)));
  }
  
  return [...new Set(configFiles)].sort();
}

async function extractDependencies(projectPath, projectType) {
  const dependencies = {};
  
  try {
    switch (projectType) {
      case 'node':
        const pkgPath = path.join(projectPath, 'package.json');
        const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
        dependencies.runtime = Object.keys(pkg.dependencies || {});
        dependencies.dev = Object.keys(pkg.devDependencies || {});
        dependencies.peer = Object.keys(pkg.peerDependencies || {});
        break;
        
      case 'python':
        // Check requirements.txt
        try {
          const reqPath = path.join(projectPath, 'requirements.txt');
          const content = await fs.readFile(reqPath, 'utf-8');
          dependencies.requirements = content
            .split('\n')
            .filter(line => line.trim() && !line.startsWith('#'))
            .map(line => line.split(/[><=!]/)[0].trim());
        } catch {}
        
        // Check pyproject.toml
        try {
          const pyprojectPath = path.join(projectPath, 'pyproject.toml');
          const content = await fs.readFile(pyprojectPath, 'utf-8');
          dependencies.pyproject = 'Found (parsing requires toml library)';
        } catch {}
        break;
        
      case 'rust':
        try {
          const cargoPath = path.join(projectPath, 'Cargo.toml');
          const content = await fs.readFile(cargoPath, 'utf-8');
          dependencies.cargo = 'Found (parsing requires toml library)';
        } catch {}
        break;
        
      case 'go':
        try {
          const modPath = path.join(projectPath, 'go.mod');
          const content = await fs.readFile(modPath, 'utf-8');
          const requires = content.match(/require\s*\(([\s\S]*?)\)/);
          if (requires) {
            dependencies.go = requires[1]
              .split('\n')
              .filter(line => line.trim())
              .map(line => line.trim().split(/\s+/)[0]);
          }
        } catch {}
        break;
    }
  } catch (error) {
    console.error('Error extracting dependencies:', error);
  }
  
  return dependencies;
}

async function calculateProjectStats(projectPath) {
  const stats = {
    totalFiles: 0,
    totalDirectories: 0,
    totalSize: 0,
    byExtension: {},
    largestFiles: []
  };
  
  const allFiles = await glob(toGlobPath(path.join(projectPath, '**/*')), {
    ignore: ['**/node_modules/**', '**/.git/**'],
    stat: true,
    withFileTypes: true
  });
  
  const fileSizes = [];
  
  for (const item of allFiles) {
    const fullPath = item.fullpath();
    const stat = await fs.stat(fullPath);
    
    if (stat.isFile()) {
      stats.totalFiles++;
      stats.totalSize += stat.size;
      
      const ext = path.extname(fullPath).toLowerCase() || 'no-extension';
      stats.byExtension[ext] = (stats.byExtension[ext] || 0) + 1;
      
      fileSizes.push({
        path: path.relative(projectPath, fullPath),
        size: stat.size,
        sizeHuman: formatBytes(stat.size)
      });
    } else if (stat.isDirectory()) {
      stats.totalDirectories++;
    }
  }
  
  // Get top 10 largest files
  stats.largestFiles = fileSizes
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  
  stats.totalSizeHuman = formatBytes(stats.totalSize);
  
  return stats;
}

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Filesystem tools
      {
        name: 'read_file',
        description: 'Read the contents of a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to the file' },
            encoding: { type: 'string', description: 'File encoding (default: utf-8)', default: 'utf-8' }
          },
          required: ['path']
        }
      },
      {
        name: 'write_file',
        description: 'Write content to a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to the file' },
            content: { type: 'string', description: 'Content to write' }
          },
          required: ['path', 'content']
        }
      },
      {
        name: 'edit_file',
        description: 'Edit a file by replacing text',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to the file' },
            oldText: { type: 'string', description: 'Text to replace' },
            newText: { type: 'string', description: 'Replacement text' }
          },
          required: ['path', 'oldText', 'newText']
        }
      },
      {
        name: 'create_directory',
        description: 'Create a directory (including parent directories)',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to the directory' }
          },
          required: ['path']
        }
      },
      {
        name: 'list_directory',
        description: 'List contents of a directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to the directory', default: '.' }
          }
        }
      },
      {
        name: 'move_file',
        description: 'Move or rename a file or directory',
        inputSchema: {
          type: 'object',
          properties: {
            source: { type: 'string', description: 'Source path' },
            destination: { type: 'string', description: 'Destination path' }
          },
          required: ['source', 'destination']
        }
      },
      {
        name: 'delete_file',
        description: 'Delete a file or directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to delete' }
          },
          required: ['path']
        }
      },
      {
        name: 'search_files',
        description: 'Search for files by name pattern',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: { type: 'string', description: 'Search pattern' },
            searchPath: { type: 'string', description: 'Directory to search in', default: '.' },
            maxResults: { type: 'number', description: 'Maximum results', default: 100 }
          },
          required: ['pattern']
        }
      },
      {
        name: 'get_file_info',
        description: 'Get detailed information about a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to the file' }
          },
          required: ['path']
        }
      },
      
      // Code search
      {
        name: 'search_code',
        description: 'Search for code patterns across files',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            searchPath: { type: 'string', description: 'Directory to search', default: '.' },
            fileExtensions: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'File extensions to search (null for defaults)' 
            },
            regex: { type: 'boolean', description: 'Use regex search', default: false },
            caseSensitive: { type: 'boolean', description: 'Case sensitive search', default: true },
            maxResults: { type: 'number', description: 'Maximum results', default: 100 }
          },
          required: ['query']
        }
      },
      
      // Project analysis
      {
        name: 'analyze_project_structure',
        description: 'Analyze project structure and extract metadata',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: { type: 'string', description: 'Project directory', default: '.' }
          }
        }
      },
      
      // Utilities
      {
        name: 'execute_command',
        description: 'Execute a shell command',
        inputSchema: {
          type: 'object',
          properties: {
            command: { type: 'string', description: 'Command to execute' },
            cwd: { type: 'string', description: 'Working directory', default: '.' },
            timeout: { type: 'number', description: 'Timeout in milliseconds', default: 30000 }
          },
          required: ['command']
        }
      },
      {
        name: 'parse_json',
        description: 'Parse JSON string',
        inputSchema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'JSON content to parse' }
          },
          required: ['content']
        }
      },
      {
        name: 'parse_yaml',
        description: 'Parse YAML string',
        inputSchema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'YAML content to parse' }
          },
          required: ['content']
        }
      },
      {
        name: 'calculate_hash',
        description: 'Calculate hash of a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path' },
            algorithm: { 
              type: 'string', 
              description: 'Hash algorithm', 
              default: 'sha256',
              enum: ['md5', 'sha1', 'sha256', 'sha512']
            }
          },
          required: ['path']
        }
      },
      {
        name: 'encode_decode',
        description: 'Encode or decode content between formats',
        inputSchema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'Content to encode/decode' },
            from: { type: 'string', description: 'Source encoding', default: 'utf-8' },
            to: { type: 'string', description: 'Target encoding', default: 'base64' }
          },
          required: ['content']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  console.error('\n🛠️  TOOL CALL RECEIVED:', name);
  console.error('📋 Arguments:', JSON.stringify(args, null, 2));
  
  if (!(name in toolHandlers)) {
    console.error('❌ Unknown tool:', name);
    throw new Error(`Unknown tool: ${name}`);
  }
  
  try {
    const startTime = Date.now();
    const result = await toolHandlers[name](args);
    const duration = Date.now() - startTime;
    console.error(`✅ Tool ${name} completed in ${duration}ms`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    console.error(`❌ Tool ${name} failed:`, error.message);
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({ error: error.message }, null, 2) 
      }],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error(`${SERVER_NAME} v${SERVER_VERSION} running on stdio`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
