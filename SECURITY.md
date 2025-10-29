# Security Guidelines

## 🔒 Protecting Production Data

### Critical Rules

1. **NEVER commit `.env` files**
   - `.env` files contain sensitive credentials
   - Always use `.env.example` as a template
   - Verify `.env` is in `.gitignore`

2. **ALWAYS use separate databases**
   - Development: `microsite_tracker_dev` or separate Supabase project
   - Production: Production Supabase database
   - ⚠️ NEVER connect to production database locally

3. **Environment Variable Management**
   - Local: Use `.env` file (not committed)
   - Production: Set in hosting platform (Railway/Render)
   - Never hardcode credentials in code

4. **Storage Mode Settings**
   - Local Development: `USE_TEMP_STORAGE=true`
   - Production: `USE_TEMP_STORAGE=false`
   - ⚠️ NEVER set `USE_TEMP_STORAGE=false` in local `.env`

### Pre-Commit Checklist

Before committing code:

- [ ] No `.env` file in Git
- [ ] `.gitignore` includes `.env*`
- [ ] No hardcoded database URLs
- [ ] No production credentials in code
- [ ] All sensitive data in environment variables only

### Deployment Checklist

Before deploying to production:

- [ ] Environment variables set in hosting platform
- [ ] `DATABASE_URL` points to production (not dev)
- [ ] `USE_TEMP_STORAGE=false` in production
- [ ] `NODE_ENV=production` set
- [ ] Branch protection enabled on `main`
- [ ] PR reviews completed

### Incident Response

If production credentials are accidentally committed:

1. **IMMEDIATELY** rotate credentials (database password, API keys)
2. Remove file from Git history: `git filter-branch` or BFG Repo-Cleaner
3. Update `.gitignore` if needed
4. Add credentials to hosting platform environment variables
5. Document the incident

### Best Practices

- Use separate Supabase projects for dev/staging/production
- Rotate credentials regularly
- Use strong, unique passwords
- Enable two-factor authentication on hosting platforms
- Review PRs carefully for sensitive data
- Use branch protection on `main` branch

