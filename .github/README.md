# GitHub Workflows

## Current Status

Workflows are stored locally but not pushed to GitHub because the Personal Access Token needs the `workflow` scope.

## To Add Workflows Back:

### Option 1: Update Token with Workflow Scope

1. Go to: https://github.com/settings/tokens
2. Edit your token or create a new one
3. Add `workflow` scope (in addition to `repo`)
4. Use the new token to push:

```bash
git remote set-url origin https://fahimkhan-git:[NEW_TOKEN]@github.com/fahimkhan-git/Microsite-Tracker-Dashboard.git
git add .github/workflows/
git commit -m "feat: Add GitHub Actions workflows"
git push origin main
git remote set-url origin https://github.com/fahimkhan-git/Microsite-Tracker-Dashboard.git
```

### Option 2: Add via GitHub UI

You can also add the workflow files directly via GitHub's web interface:
1. Go to your repository on GitHub
2. Navigate to: `.github/workflows/`
3. Click "Add file" → "Upload files"
4. Upload `pr-checks.yml`

## Workflows Included:

- **pr-checks.yml**: Checks for sensitive files (.env) and runs build tests on pull requests

