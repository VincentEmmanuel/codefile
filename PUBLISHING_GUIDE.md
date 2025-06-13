# Publishing CodeFile to npm

Follow these steps to publish CodeFile so it can be used with `npx`.

## Prerequisites

1. **npm account**: Create one at https://www.npmjs.com/signup
2. **Git repository**: Push your code to GitHub/GitLab/etc.
3. **Check name availability**: Verify "codefile" is available on npm

## Step 1: Update package.json

Replace placeholders in package.json:
- `Your Name <your.email@example.com>` → Your actual name and email
- ✅ GitHub URLs already updated!

## Step 2: Test Locally

Test the package works before publishing:

```bash
# In the project directory
npm link

# In another directory, test the setup command
npx codefile-setup

# Test running the server
npx codefile
```

## Step 3: Login to npm

```bash
npm login
# Enter your npm username, password, and email
```

## Step 4: Publish to npm

For the first publish:
```bash
npm publish
```

For updates:
```bash
npm version patch  # or minor/major
npm publish
```

## Step 5: Test Installation

Once published, users can install it:

### Method 1: Automatic Setup
```bash
npx codefile setup
```

### Method 2: Manual Config
Users add to their Claude Desktop config:
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

## Making it Even Easier

### 1. The setup command is already configured
Users can run:
```bash
npx codefile setup
```

### 2. Auto-Update Support
The npx command with `-y` flag always fetches the latest version, so users automatically get updates.

### 3. Simple Package Name
Since you're using "codefile" (not scoped like @username/package), users have a clean, simple command.

## Example: Complete Setup Flow

After publishing, your users will be able to:

```bash
# One-time setup
npx codefile setup

# Or if using Smithery
npx @smithery/cli install codefile --client claude

# To uninstall
npx codefile setup --uninstall
```

## Version Management

1. **Patch version** (1.0.1): Bug fixes
   ```bash
   npm version patch
   ```

2. **Minor version** (1.1.0): New features, backward compatible
   ```bash
   npm version minor
   ```

3. **Major version** (2.0.0): Breaking changes
   ```bash
   npm version major
   ```

Always run `npm publish` after version bump.

## Troubleshooting

### "Package name unavailable"
- Add a scope: `@yourusername/package-name`
- Or choose a different name

### "No repository field"
- Add repository info to package.json

### "Files missing after install"
- Check .npmignore file
- Ensure all necessary files are included

## Best Practices

1. **Semantic Versioning**: Follow semver.org guidelines
2. **Changelog**: Maintain a CHANGELOG.md
3. **Documentation**: Keep README updated
4. **Testing**: Test each release before publishing
5. **npm Scripts**: Add useful scripts for users

## Next Steps

1. Update all placeholders in the code
2. Test everything locally
3. Publish to npm
4. Share with the community!

Your MCP Code Server will then work exactly like Desktop Commander - users can simply run `npx @your-username/mcp-code-server setup` and start using it immediately.
