# Environment Variables Setup untuk Render

Panduan lengkap untuk setup environment variables di Render.

## Environment Variables yang Diperlukan

### 1. DATABASE_URL (Required)

Connection string untuk PostgreSQL database.

**Format:**
```
postgresql+psycopg://user:password@host/database?sslmode=require
```

**Cara mendapatkan:**

#### Option A: Render PostgreSQL Database
1. Di Render dashboard, klik **"New +"** → **"PostgreSQL"**
2. Pilih plan (Free tier tersedia)
3. Set name dan region
4. Setelah database dibuat, klik database name
5. Di tab **"Connections"**, copy **"Internal Database URL"** atau **"External Database URL"**
6. Pastikan format menggunakan `postgresql+psycopg://` (bukan `postgresql://`)

**Contoh:**
```
postgresql+psycopg://user:password@dpg-xxxxx-a.singapore-postgres.render.com/dbname?sslmode=require
```

#### Option B: Database Eksternal (Neon, Supabase, dll)
- **Neon**: Copy connection string dari dashboard, pastikan format `postgresql+psycopg://`
- **Supabase**: Copy connection string dari Settings → Database

**Cara set di Render:**
1. Buka Web Service di Render dashboard
2. Klik **"Environment"** tab
3. Klik **"Add Environment Variable"**
4. Key: `DATABASE_URL`
5. Value: Paste connection string
6. Klik **"Save Changes"**

---

### 2. SESSION_SECRET (Required)

Secret key untuk session encryption. Minimum 32 characters.

**Cara generate:**

#### Option A: Generate Lokal
```bash
cd backend
python generate_secret.py
```

Output akan seperti:
```
Generated SESSION_SECRET:
abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567yz
```

#### Option B: Generate Online
- Gunakan: https://randomkeygen.com/
- Pilih "CodeIgniter Encryption Keys" atau "Fort Knox Password"
- Copy salah satu (minimum 32 characters)

#### Option C: Biarkan Render Generate
- Di Render dashboard, saat add environment variable
- Pilih **"Generate"** untuk auto-generate

**Cara set di Render:**
1. Buka Web Service di Render dashboard
2. Klik **"Environment"** tab
3. Klik **"Add Environment Variable"**
4. Key: `SESSION_SECRET`
5. Value: Paste secret key yang sudah di-generate
6. Klik **"Save Changes"**

**Contoh:**
```
SESSION_SECRET=abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567yz
```

---

### 3. CORS_ORIGINS (Required)

Frontend domain(s) yang diizinkan untuk CORS. Comma-separated.

**Format:**
```
https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

**Untuk Development:**
```
http://localhost:5173,http://localhost:5174
```

**Untuk Production:**
```
https://your-frontend.onrender.com,https://www.your-frontend.onrender.com
```

**Cara set di Render:**
1. Buka Web Service di Render dashboard
2. Klik **"Environment"** tab
3. Klik **"Add Environment Variable"**
4. Key: `CORS_ORIGINS`
5. Value: Frontend domain(s), comma-separated
6. Klik **"Save Changes"**

**Contoh:**
```
CORS_ORIGINS=https://myapp.onrender.com,https://www.myapp.onrender.com
```

---

### 4. PORT (Optional)

Port untuk server. Render akan set otomatis ke `10000`.

**Tidak perlu set manual** - Render akan set otomatis via environment variable `PORT`.

Jika ingin set manual:
```
PORT=10000
```

---

### 5. SUPABASE_URL (Optional)

Jika menggunakan Supabase untuk profile picture storage.

**Cara mendapatkan:**
1. Buka Supabase dashboard
2. Settings → API
3. Copy **"Project URL"**

**Contoh:**
```
SUPABASE_URL=https://xxxxx.supabase.co
```

---

### 6. SUPABASE_KEY (Optional)

Service role key untuk Supabase (jika menggunakan Supabase storage).

**Cara mendapatkan:**
1. Buka Supabase dashboard
2. Settings → API
3. Copy **"service_role" key** (bukan anon key!)

**Contoh:**
```
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Cara Set Environment Variables di Render

### Via Dashboard (Recommended)

1. Login ke [Render Dashboard](https://dashboard.render.com)
2. Pilih Web Service Anda
3. Klik tab **"Environment"**
4. Klik **"Add Environment Variable"**
5. Masukkan:
   - **Key**: Nama variable (contoh: `DATABASE_URL`)
   - **Value**: Nilai variable
6. Klik **"Save Changes"**
7. Render akan auto-redeploy setelah save

### Via render.yaml (Optional)

Jika menggunakan `render.yaml`, bisa set di file:

```yaml
services:
  - type: web
    name: backend-api
    envVars:
      - key: DATABASE_URL
        sync: false  # Set manually in dashboard
      - key: SESSION_SECRET
        generateValue: true  # Auto-generate
      - key: CORS_ORIGINS
        sync: false  # Set manually in dashboard
```

**Note:** `sync: false` berarti harus set manual di dashboard.

---

## Checklist Environment Variables

Sebelum deploy, pastikan sudah set:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SESSION_SECRET` - Secret key (min 32 chars)
- [ ] `CORS_ORIGINS` - Frontend domain(s)
- [ ] `SUPABASE_URL` (optional) - Jika menggunakan Supabase
- [ ] `SUPABASE_KEY` (optional) - Jika menggunakan Supabase

---

## Verifikasi Environment Variables

Setelah set environment variables, verifikasi:

1. **Check di Render Dashboard:**
   - Buka Web Service → Environment tab
   - Pastikan semua variables sudah ada

2. **Check di Logs:**
   - Buka Web Service → Logs tab
   - Cari warning tentang missing variables
   - Jika ada warning, berarti variable belum diset

3. **Test Application:**
   - Test health endpoint: `https://your-service.onrender.com/health`
   - Test API endpoints
   - Check browser console untuk CORS errors

---

## Troubleshooting

### Error: "Please set DATABASE_URL environment variable"

**Solusi:**
- Pastikan `DATABASE_URL` sudah diset di Render dashboard
- Pastikan format benar: `postgresql+psycopg://...`
- Restart service setelah set variable

### Error: "Please set SESSION_SECRET environment variable"

**Solusi:**
- Generate secret dengan `python generate_secret.py`
- Set di Render dashboard sebagai `SESSION_SECRET`
- Pastikan minimum 32 characters

### CORS Errors

**Solusi:**
- Pastikan `CORS_ORIGINS` sudah diset
- Include protocol (https://) di origins
- Pastikan frontend URL ada di `CORS_ORIGINS`
- Restart service setelah set variable

### Database Connection Error

**Solusi:**
- Pastikan `DATABASE_URL` format benar
- Pastikan database accessible dari Render
- Check SSL mode (`?sslmode=require`)
- Pastikan menggunakan `postgresql+psycopg://` bukan `postgresql://`

---

## Quick Reference

```bash
# Generate SESSION_SECRET
cd backend
python generate_secret.py

# Copy output dan set di Render dashboard sebagai:
SESSION_SECRET=<output-dari-generate_secret.py>
```

**Environment Variables di Render Dashboard:**
```
DATABASE_URL=postgresql+psycopg://user:password@host/database?sslmode=require
SESSION_SECRET=your-generated-secret-key-minimum-32-characters
CORS_ORIGINS=https://your-frontend.onrender.com
```

---

## Next Steps

1. ✅ Set semua required environment variables
2. ✅ Deploy service
3. ✅ Test health endpoint
4. ✅ Test API endpoints
5. ✅ Update frontend dengan backend URL production
