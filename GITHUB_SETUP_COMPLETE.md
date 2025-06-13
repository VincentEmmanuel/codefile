# GitHub Setup Guide for CodeFile

This guide will help you push your code to GitHub and set up your repository completely.

## 📋 Pre-Push Checklist

✅ **GitHub URLs Updated:**
- package.json - ✓ Updated to VincentEmmanuel/codefile
- README.md - ✓ Updated
- install.sh - ✓ Updated  
- install.ps1 - ✓ Updated

⚠️ **Still Need Your Info:**
- package.json: Replace `Your Name <your.email@example.com>` with your actual name and email
- LICENSE: Replace `Your Name` with your actual name

## 🚀 Step 1: Initialize Git and Push

Open a terminal in your project directory (`C:\MCP\MCP-Code`) and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - CodeFile MCP Server"

# Add your GitHub repository as origin
git remote add origin https://github.com/VincentEmmanuel/codefile.git

# Push to GitHub (main branch)
git branch -M main
git push -u origin main
```

## 📝 Step 2: Set Up GitHub Repository

### Repository Settings
1. Go to https://github.com/VincentEmmanuel/codefile/settings
2. Add a description: "MCP server for code operations, filesystem management, and project analysis"
3. Add topics: `mcp`, `claude`, `ai-tools`, `filesystem`, `code-search`
4. Add website: (you can add npm link later after publishing)

### Create Releases (Optional but Recommended)
1. Go to https://github.com/VincentEmmanuel/codefile/releases
2. Click "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: "CodeFile v1.0.0 - Initial Release"
5. Describe features in the release notes
6. Click "Publish release"

## 📦 Step 3: Prepare for npm Publishing

### Update package.json with your info:
```json
"author": "Vincent Emmanuel <your.email@example.com>",
```

### Update LICENSE:
Replace `Your Name` with `Vincent Emmanuel`

### Test Everything Works:
```bash
# Test the binary works
node bin/codefile.js

# Test the setup script
node bin/setup.js --help

# Test npm link locally
npm link
npx codefile
npx codefile-setup
npm unlink
```

## 🎯 Step 4: Publish to npm

```bash
# Check if "codefile" is available
npm view codefile

# If available (404 error), login and publish
npm login
npm publish
```

## 📢 Step 5: Update GitHub After npm Publish

Once published to npm, update your GitHub repository:

1. **Update README.md** to mention npm installation is live
2. **Add npm badge** to README.md:
   ```markdown
   [![npm version](https://img.shields.io/npm/v/codefile.svg)](https://www.npmjs.com/package/codefile)
   ```
3. **Update repository website** in settings to: https://www.npmjs.com/package/codefile

## 🔄 Step 6: Set Up GitHub Actions (Optional)

Create `.github/workflows/npm-publish.yml` for automatic npm publishing:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

To use this:
1. Get npm access token from https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Add it to GitHub secrets: Settings → Secrets → Actions → New repository secret
3. Name: `NPM_TOKEN`, Value: your npm token

## 🎉 Complete Setup Commands

Here's everything in order:

```bash
# 1. Update your info in package.json and LICENSE first!

# 2. Initialize and push to GitHub
git init
git add .
git commit -m "Initial commit - CodeFile MCP Server"
git remote add origin https://github.com/VincentEmmanuel/codefile.git
git branch -M main
git push -u origin main

# 3. Test locally
npm link
npx codefile --version
npm unlink

# 4. Publish to npm
npm login
npm publish

# 5. Create GitHub release
# Do this through GitHub web interface
```

## 📋 Final Checklist

- [ ] Update author info in package.json
- [ ] Update name in LICENSE file
- [ ] Push code to GitHub
- [ ] Add repository description and topics
- [ ] Test npm commands locally
- [ ] Publish to npm
- [ ] Create GitHub release
- [ ] Update README with npm badge
- [ ] (Optional) Set up GitHub Actions

## 🎊 Success!

Once complete, users can install CodeFile with:
```bash
npx codefile setup
```

And your repository will be fully set up with both GitHub and npm!
