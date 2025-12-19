# Fix IPv6 Connection Error untuk Supabase

## Error yang Terjadi
```
connection to server at "2406:da18:243:741c:c48:8709:c950:b1c3", port 6543 failed: Network is unreachable
```

## Penyebab
Error ini terjadi karena:
1. **Hostname di-resolve ke IPv6** - `db.eeygswpiygbqdztagizv.supabase.co` di-resolve ke IPv6 address
2. **IPv6 tidak accessible** dari Render network
3. **Perlu force IPv4** atau gunakan connection string yang berbeda

## Solusi

### Option 1: Gunakan Direct Connection dengan IPv4 (Recommended)

**Set di Render Dashboard → Environment → `DATABASE_URL`:**

```
postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require&connect_timeout=10
```

**Perbedaan:**
- Port `5432` (direct connection, bukan pooling)
- Tambahkan `&connect_timeout=10` untuk timeout handling

### Option 2: Check Supabase IP Whitelist

1. **Buka Supabase Dashboard**
2. **Settings → Database**
3. **Check IP Restrictions:**
   - Pastikan tidak ada IP whitelist yang memblokir Render
   - Atau tambahkan Render IP ke whitelist jika ada

### Option 3: Gunakan Connection String dari Supabase Dashboard

1. **Buka Supabase Dashboard**
2. **Settings → Database**
3. **Copy Connection String** langsung dari dashboard
4. **Ubah format:**
   - Jika `postgresql://` → ubah menjadi `postgresql+psycopg://`
   - Tambahkan `&connect_timeout=10` jika belum ada
5. **Set di Render**

## Connection String yang Harus Digunakan

### Recommended (Direct Connection dengan Timeout)
```
DATABASE_URL=postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require&connect_timeout=10
```

**PENTING:**
- Port `5432` (direct, bukan 6543)
- Tambahkan `&connect_timeout=10`
- **TANPA quotes**

## Langkah-langkah

1. **Push kode terbaru** (sudah di-commit dengan IPv4 handling)
2. **Render Dashboard → Environment → Edit `DATABASE_URL`**
3. **Set value:**
   ```
   postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require&connect_timeout=10
   ```
4. **Pastikan TANPA quotes**
5. **Save Changes**
6. **Tunggu auto-redeploy**

## Kode yang Sudah Diperbaiki

Kode sekarang sudah:
- ✅ Auto-strip quotes dari `DATABASE_URL`
- ✅ Auto-add `connect_timeout` untuk Supabase
- ✅ Auto-add `sslmode=require` jika belum ada
- ✅ Better connection pool settings

## Checklist

- [ ] Kode sudah di-push ke GitHub
- [ ] `DATABASE_URL` menggunakan port `5432` (direct connection)
- [ ] `DATABASE_URL` ada `&connect_timeout=10`
- [ ] `DATABASE_URL` **TANPA quotes**
- [ ] Sudah di-save di Render
- [ ] Service sudah di-redeploy

## Jika Masih Error

### Check 1: Verifikasi Password
- Supabase Dashboard → Settings → Database
- Check password yang benar
- Update jika berbeda

### Check 2: Test Connection
Coba test dari local machine:
```bash
psql "postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require"
```

### Check 3: Check Supabase Status
- Pastikan Supabase database active
- Check jika ada maintenance
