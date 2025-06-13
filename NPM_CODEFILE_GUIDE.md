# NPM Publishing Guide for CodeFile

You're all set to publish "codefile" to npm! Here's your checklist:

## ✅ Pre-flight Check

1. **Check if "codefile" is available on npm:**
   ```bash
   npm view codefile
   ```
   If it says "404 Not Found", you're good! The name is available.

2. **Update package.json** with your info:
   - Replace `Your Name <your.email@example.com>` with your actual name/email
   - Replace `https://github.com/your-username/codefile` with your GitHub repo URL

## 🚀 Publishing Steps

### 1. Create npm account (if you don't have one)
Visit https://www.npmjs.com/signup

### 2. Login to npm
```bash
npm login
```

### 3. Test locally first
```bash
# In your project directory
npm link

# Test the commands work
npx codefile
npx codefile-setup
```

### 4. Publish!
```bash
npm publish
```

That's it! 🎉

## 📦 What Users Get

After publishing, users can install CodeFile with just:

```bash
# Automatic setup (configures Claude Desktop)
npx codefile setup

# Or manual config
npx codefile
```

They'll get:
- Auto-configuration of Claude Desktop
- Always latest version with `npx -y codefile`
- Simple uninstall: `npx codefile setup --uninstall`

## 🔄 Updating Your Package

When you make changes:
```bash
# Bump version (patch for bug fixes, minor for features, major for breaking changes)
npm version patch

# Publish the update
npm publish
```

## 📝 Files Updated for "codefile"

All references have been updated from "mcp-code-server" to "codefile":
- ✅ package.json (name, bin entries)
- ✅ README.md 
- ✅ bin/setup.js
- ✅ bin/mcp-code-server.js
- ✅ server.js (SERVER_NAME)
- ✅ claude_desktop_config_example.json
- ✅ PUBLISHING_GUIDE.md
- ✅ README.npm.md

## 🎯 Why This is Better Than GitHub-Only

- **Simpler command**: `npx codefile` vs long GitHub URLs
- **Auto-updates**: Users always get latest with `npx -y`
- **Professional**: Shows up in npm search
- **Version control**: Semantic versioning
- **Stats**: See download counts on npm

You chose the right approach! Desktop Commander uses npm for these same reasons.

Good luck with your publishing! 🚀
