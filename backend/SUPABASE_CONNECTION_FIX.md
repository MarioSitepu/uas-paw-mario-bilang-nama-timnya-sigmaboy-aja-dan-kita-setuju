# Fix Supabase Connection Error

## Error
```
connection to server at "2406:da18:243:741c:c48:8709:c950:b1c3", port 5432 failed: Network is unreachable
```

## Masalah
Masih error "Network is unreachable" meskipun sudah set `DATABASE_URL`. Kemungkinan:
1. Password perlu di-URL-encode
2. Format connection string masih salah
3. Host resolution issue

## Solusi

### Step 1: URL-encode Password

Password `YGRhLtYar3RVU3ua` mungkin perlu di-URL-encode jika ada karakter khusus.

**Password asli:** `YGRhLtYar3RVU3ua`
**Password URL-encoded:** `YGRhLtYar3RVU3ua` (tidak perlu encode, tidak ada karakter khusus)

### Step 2: Format Connection String yang Benar

**Format untuk Supabase:**
```
postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require
```

### Step 3: Verifikasi di Render Dashboard

1. **Buka Render Dashboard**
2. **Web Service → Environment tab**
3. **Check `DATABASE_URL`:**
   - Pastikan format: `postgresql+psycopg://...`
   - Pastikan password: `YGRhLtYar3RVU3ua`
   - Pastikan ada `?sslmode=require`
   - Pastikan host: `db.eeygswpiygbqdztagizv.supabase.co`
   - Pastikan port: `5432`

### Step 4: Alternative - Gunakan Connection Pooling URL

Supabase juga menyediakan connection pooling URL yang lebih stabil:

**Format:**
```
postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:6543/postgres?sslmode=require
```

**Perbedaan:**
- Port `5432` → Direct connection
- Port `6543` → Connection pooling (lebih stabil untuk production)

### Step 5: Check Password di Supabase

1. **Buka Supabase Dashboard**
2. **Settings → Database**
3. **Check Database Password**
4. **Pastikan password benar:** `YGRhLtYar3RVU3ua`

Jika password berbeda, update `DATABASE_URL` dengan password yang benar.

## Connection String yang Harus Digunakan

### Option 1: Direct Connection (Port 5432)
```
postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require
```

### Option 2: Connection Pooling (Port 6543) - Recommended
```
postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:6543/postgres?sslmode=require
```

## Troubleshooting

### Masih Error "Network is unreachable"

**Coba:**
1. **Gunakan Connection Pooling URL** (port 6543)
2. **Check Supabase Dashboard:**
   - Settings → Database → Connection Pooling
   - Pastikan enabled
3. **Check IP Whitelist:**
   - Supabase → Settings → Database → Connection Pooling
   - Pastikan Render IP tidak di-block

### Error "password authentication failed"

**Solusi:**
- Check password di Supabase dashboard
- Pastikan password benar: `YGRhLtYar3RVU3ua`
- Jika password berbeda, update `DATABASE_URL`

### Error "SSL connection required"

**Solusi:**
- Pastikan ada `?sslmode=require` di akhir connection string
- Supabase memerlukan SSL

## Checklist Final

- [ ] `DATABASE_URL` format: `postgresql+psycopg://...`
- [ ] Password benar: `YGRhLtYar3RVU3ua`
- [ ] Host benar: `db.eeygswpiygbqdztagizv.supabase.co`
- [ ] Port: `5432` atau `6543` (coba keduanya)
- [ ] SSL: `?sslmode=require` di akhir
- [ ] Database: `postgres`
- [ ] Sudah di-set di Render Environment variables
- [ ] Service sudah di-redeploy
