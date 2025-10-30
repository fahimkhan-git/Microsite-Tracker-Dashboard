# Push to New GitHub Repository & Wrangler Setup

## 🔐 Issue 1: GitHub Authentication

The push failed because you need to authenticate with the new GitHub account (`fahimkhan-git`).

### Option A: Use SSH (Recommended if you have SSH key set up)

```bash
# Change remote to SSH
git remote set-url origin git@github.com:fahimkhan-git/Microsite-Tracker-Dashboard.git

# Push
git push -u origin main
```

### Option B: Use Personal Access Token (PAT)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Select scopes: `repo` (full control)
4. Generate and copy the token
5. Use it as password:

```bash
# Push with token
git push -u origin main
# Username: fahimkhan-git
# Password: [paste your token here]
```

### Option C: Use GitHub CLI

```bash
# Install GitHub CLI if not installed
brew install gh

# Login
gh auth login

# Push
git push -u origin main
```

---

## 📦 Issue 2: Node.js Version for Wrangler

Wrangler requires **Node.js v20+**, but you have **v18.20.8**.

### Option A: Update Node.js using nvm (Recommended)

```bash
# Install nvm if not installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or reload
source ~/.zshrc

# Install Node.js v20
nvm install 20
nvm use 20

# Verify
node --version  # Should show v20.x.x

# Now install Wrangler
npm install -g wrangler
wrangler --version
```

### Option B: Update Node.js using Homebrew (macOS)

```bash
# Install latest Node.js
brew install node@20

# Link it
brew link --overwrite node@20

# Verify
node --version

# Install Wrangler
npm install -g wrangler
```

### Option C: Use npx (No Install Needed)

You can use `npx` but it still needs Node.js v20+:

```bash
# After updating Node.js to v20+
cd workers
npx wrangler@latest login
npx wrangler@latest deploy
```

---

## ✅ Quick Steps

1. **Update Node.js to v20+** (choose one method above)
2. **Authenticate with GitHub** (choose one method above)
3. **Push code:**
   ```bash
   git push -u origin main
   ```
4. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   wrangler --version
   ```
5. **Login to Cloudflare:**
   ```bash
   cd workers
   wrangler login
   ```

---

## 🎯 After Setup

Once both are done:

```bash
# Navigate to workers directory
cd workers

# Install dependencies
npm install

# Login to Cloudflare
wrangler login

# Set backend URL (after Express backend is deployed)
wrangler secret put BACKEND_URL
# Enter: https://your-backend.onrender.com

# Deploy
wrangler deploy
```

---

## ❓ Troubleshooting

### "Permission denied" on git push
- Use SSH or Personal Access Token (see above)
- Make sure you're logged into the correct GitHub account

### "Wrangler requires Node.js v20"
- Update Node.js first (see above)
- Verify with: `node --version`

### "Cannot find wrangler command"
- Make sure Node.js v20+ is active: `node --version`
- Reinstall: `npm install -g wrangler`
- Or use: `npx wrangler@latest`

