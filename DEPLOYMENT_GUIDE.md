# 🚀 Vercel Deployment Guide

## ✅ Fix Applied: PostgreSQL Connection Error

### Problem:
```
Error: Please install pg package manually
```

### Root Cause:
- Next.js webpack config tidak include `pg` dan `pg-hstore` packages
- Packages ter-exclude dari bundle, sehingga Vercel tidak bisa load Sequelize PostgreSQL driver

### Solution:
Updated `next.config.js` to externalize PostgreSQL packages:
```javascript
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals.push({
      sequelize: "commonjs sequelize",
      pg: "commonjs pg",               // ← Added
      "pg-hstore": "commonjs pg-hstore", // ← Added
    });
  }
  return config;
}
```

---

## 📋 Deployment Checklist

### 1. **Environment Variables di Vercel**
Pastikan semua env variables sudah di-set di Vercel Dashboard:

```bash
# Vercel Dashboard > Project Settings > Environment Variables

NEXT_PUBLIC_SUPABASE_URL=https://jqwvwrkxzimqcatvcjko.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:vylbouquet1945@db.jqwvwrkxzimqcatvcjko.supabase.co:5432/postgres
JWT_SECRET=vyl-bouquet-secret-key-production-2025
STORAGE_BUCKET=vylbouquet_file
```

**Important:** 
- Set environment untuk **Production**, **Preview**, dan **Development**
- Jangan lupa save setelah input semua variables

### 2. **Commit & Push Changes**
```bash
git add .
git commit -m "fix: add pg packages to webpack externals for Vercel deployment"
git push origin main
```

### 3. **Trigger Redeploy di Vercel**
- Vercel akan auto-deploy saat push ke main
- Atau manual redeploy di Vercel Dashboard > Deployments > Redeploy

### 4. **Verify Deployment**
Check logs di Vercel Dashboard:
- ✅ Build successful
- ✅ No "Please install pg package manually" error
- ✅ Database connection successful

Test endpoints:
- `https://your-app.vercel.app/api/bouquets` → Should return bouquets
- `https://your-app.vercel.app/api/settings` → Should return settings
- `https://your-app.vercel.app/login` → Should load login page

---

## 🔧 Additional Configuration

### Files Modified:
1. **next.config.js** - Added `pg` and `pg-hstore` to webpack externals
2. **.env.example** - Created template for environment variables
3. **vercel.json** - Optional production config

### Supabase Setup Checklist:
- [ ] Database tables created (run SUPABASE_SETUP.md SQL)
- [ ] Storage bucket `vylbouquet_file` created and public
- [ ] Storage policies configured (read/insert)
- [ ] Admin user seeded (run seed-admin.js or POST /api/auth/seed-admin)
- [ ] Settings seeded (run seed-settings.js)

---

## 🐛 Troubleshooting

### Still Getting "Please install pg package manually"?
1. Check `package.json` contains:
   ```json
   "dependencies": {
     "pg": "^8.11.3",
     "pg-hstore": "^2.3.4",
     "sequelize": "^6.37.3"
   }
   ```

2. Clear Vercel build cache:
   - Vercel Dashboard > Settings > General
   - Scroll to "Build & Development Settings"
   - Click "Clear Build Cache"
   - Redeploy

3. Check webpack config in `next.config.js`:
   - Must externalize: `sequelize`, `pg`, `pg-hstore`

### Database Connection Failed?
1. Verify `DATABASE_URL` format:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```

2. Check Supabase Database is active:
   - Supabase Dashboard > Database
   - Should show "Active"

3. Test connection locally first:
   ```bash
   npm run dev
   # Should see: ✅ Database connected successfully
   ```

### Environment Variables Not Found?
1. Check Vercel Dashboard > Settings > Environment Variables
2. Variables must be set for **all environments** (Production, Preview, Development)
3. After adding variables, **redeploy required**

---

## 📊 Expected Vercel Build Output

Successful build should show:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (x/x)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                   xyz kB        xyz kB
├ ○ /catalog                            xyz kB        xyz kB
├ ○ /login                              xyz kB        xyz kB
...
```

No errors about:
- ❌ "Please install pg package manually"
- ❌ "Cannot find module 'pg'"
- ❌ "Sequelize connection failed"

---

## 🚀 Next Steps After Deployment

1. **Seed Database** (if not done):
   ```bash
   # Run locally or via Vercel function
   POST https://your-app.vercel.app/api/auth/seed-admin
   ```

2. **Test Login**:
   - Go to `https://your-app.vercel.app/login`
   - Username: `vylbouquet`
   - Password: `vyl812@bouquet`

3. **Upload First Bouquet**:
   - Login → Bouquets → Tambah Buket
   - Upload image → Should upload to Supabase Storage
   - Save → Should save to database

4. **Test Customer Flow**:
   - Go to `/catalog` → Should show bouquets
   - Go to `/order` → Create order
   - Should redirect to WhatsApp after submit

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | `eyJhbGci...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:pass@...` |
| `JWT_SECRET` | Secret for JWT token signing | `your-secret-key` |
| `STORAGE_BUCKET` | Supabase Storage bucket name | `vylbouquet_file` |

**Get from Supabase Dashboard:**
- URL & Keys: Project Settings > API
- Database URL: Project Settings > Database > Connection string

---

## ✨ Success Indicators

Deployment successful when:
- ✅ Build completes without errors
- ✅ `/api/bouquets` returns data or empty array (not 500 error)
- ✅ `/api/settings` returns data or empty object
- ✅ `/login` page loads and can authenticate
- ✅ Images upload to Supabase Storage
- ✅ Orders can be created from customer page

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Next.js Deployment Docs**: https://nextjs.org/docs/deployment
- **Sequelize PostgreSQL**: https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#postgresql
