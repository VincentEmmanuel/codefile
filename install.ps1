# MCP Code Server Installation Script for Windows
# This script automatically sets up MCP Code Server for Claude Desktop

Write-Host "🚀 MCP Code Server Quick Installer" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Visit: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Set installation directory
$installDir = "$env:USERPROFILE\.mcp\mcp-code-server"
Write-Host "📁 Installing to: $installDir" -ForegroundColor Yellow

# Create installation directory
if (Test-Path $installDir) {
    Remove-Item -Path $installDir -Recurse -Force
}
New-Item -ItemType Directory -Path $installDir -Force | Out-Null

# Download the repository
Write-Host "📥 Downloading MCP Code Server..." -ForegroundColor Yellow

try {
    # Check if git is available
    $gitVersion = git --version 2>$null
    Write-Host "   Using git to clone repository..." -ForegroundColor Gray
    git clone https://github.com/VincentEmmanuel/codefile.git $installDir 2>$null
} catch {
    Write-Host "   Using direct download (git not found)..." -ForegroundColor Gray
    $zipUrl = "https://github.com/VincentEmmanuel/codefile/archive/main.zip"
    $zipPath = "$env:TEMP\mcp-code-server.zip"
    
    # Download zip
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
    
    # Extract zip
    Expand-Archive -Path $zipPath -DestinationPath $env:TEMP -Force
    
    # Move contents
    Move-Item -Path "$env:TEMP\mcp-code-server-main\*" -Destination $installDir -Force
    
    # Cleanup
    Remove-Item -Path $zipPath -Force
    Remove-Item -Path "$env:TEMP\mcp-code-server-main" -Recurse -Force
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Push-Location $installDir
try {
    npm install --production
} finally {
    Pop-Location
}

# Configure Claude Desktop
Write-Host "⚙️  Configuring Claude Desktop..." -ForegroundColor Yellow

$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$configDir = Split-Path -Parent $configPath

# Create config directory if it doesn't exist
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Backup existing config if it exists
if (Test-Path $configPath) {
    Copy-Item -Path $configPath -Destination "$configPath.backup" -Force
    Write-Host "📋 Backed up existing config to: $configPath.backup" -ForegroundColor Gray
}

# Prepare the server path with forward slashes for JSON
$serverPath = $installDir.Replace('\', '/') + '/server.js'

# Update or create config
if (Test-Path $configPath) {
    # Config exists, update it
    $config = Get-Content -Path $configPath -Raw | ConvertFrom-Json
    
    if (!$config.mcpServers) {
        $config | Add-Member -MemberType NoteProperty -Name mcpServers -Value @{} -Force
    }
    
    $config.mcpServers | Add-Member -MemberType NoteProperty -Name 'mcp-code-server' -Value @{
        command = "node"
        args = @($serverPath)
    } -Force
    
    $config | ConvertTo-Json -Depth 10 | Set-Content -Path $configPath -Encoding UTF8
    Write-Host "✅ Configuration updated successfully" -ForegroundColor Green
} else {
    # Create new config
    $newConfig = @{
        mcpServers = @{
            'mcp-code-server' = @{
                command = "node"
                args = @($serverPath)
            }
        }
    }
    
    $newConfig | ConvertTo-Json -Depth 10 | Set-Content -Path $configPath -Encoding UTF8
    Write-Host "✅ Configuration created successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart Claude Desktop"
Write-Host "2. Look for 'mcp-code-server' in the server list"
Write-Host "3. Start using commands like:"
Write-Host "   - 'Search for TODO comments in my code'"
Write-Host "   - 'Analyze this project structure'"
Write-Host "   - 'Find all async functions'"
Write-Host ""
Write-Host "To uninstall, run:" -ForegroundColor Gray
Write-Host "  Remove-Item -Path '$installDir' -Recurse -Force"
Write-Host "  And remove the mcp-code-server entry from $configPath"
