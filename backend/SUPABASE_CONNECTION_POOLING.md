# Supabase Connection Pooling Setup

## Error yang Terjadi
```
connection to server at "2406:da18:243:741c:c48:8709:c950:b1c3", port 6543 failed: Network is unreachable
```

## Masalah
Error "Network is unreachable" dengan IPv6 address menunjukkan:
1. Masih ada quotes di `DATABASE_URL`
2. Connection Pooling mungkin tidak enabled di Supabase
3. Atau format connection string masih salah

## Solusi Lengkap

### Step 1: Enable Connection Pooling di Supabase

1. **Buka Supabase Dashboard**
2. **Settings → Database**
3. **Connection Pooling:**
   - Pastikan **enabled**
   - Jika belum, enable terlebih dahulu
4. **Copy Connection Pooling URL** jika ada

### Step 2: Pastikan DATABASE_URL TANPA Quotes

Di Render Dashboard → Environment → `DATABASE_URL`:

**SALAH:**
```
DATABASE_URL="postgresql+psycopg://..."
```

**BENAR:**
```
DATABASE_URL=postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:6543/postgres?sslmode=require
```

**PENTING:** Tidak ada quotes `"` sama sekali!

### Step 3: Alternative - Gunakan Direct Connection dengan Pool Settings

Jika Connection Pooling tidak bekerja, coba direct connection dengan pool settings:

```
DATABASE_URL=postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require&connect_timeout=10
```

### Step 4: Verifikasi Password

1. **Buka Supabase Dashboard**
2. **Settings → Database**
3. **Check Database Password**
4. **Pastikan password benar:** `YGRhLtYar3RVU3ua`

Jika password berbeda, update `DATABASE_URL`.

## Connection Strings untuk Dicoba

### Option 1: Connection Pooling (Port 6543)
```
DATABASE_URL=postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:6543/postgres?sslmode=require
```

### Option 2: Direct Connection dengan Timeout (Port 5432)
```
DATABASE_URL=postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require&connect_timeout=10
```

### Option 3: Direct Connection Simple (Port 5432)
```
DATABASE_URL=postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require
```

## Langkah-langkah Pasti

1. **Buka Render Dashboard**
2. **Web Service → Environment tab**
3. **Edit `DATABASE_URL`:**
   - **Hapus SEMUA quotes** `"` (jika ada)
   - **Coba Option 2 dulu** (direct connection dengan timeout)
   - Value:
     ```
     postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require&connect_timeout=10
     ```
4. **Save Changes**
5. **Tunggu auto-redeploy**

## Jika Masih Error

### Check 1: Verifikasi di Supabase
- Supabase Dashboard → Settings → Database
- Check Connection Pooling status
- Check Database Password
- Copy connection string langsung dari Supabase

### Check 2: Test Connection String
Coba test connection string di local:
```bash
psql "postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require"
```

### Check 3: Gunakan Connection String dari Supabase Dashboard
- Supabase → Settings → Database
- Copy connection string langsung dari dashboard
- Ubah `postgresql://` menjadi `postgresql+psycopg://`
- Set di Render

## Format Final yang Harus Dicoba

**Coba ini secara berurutan:**

1. **Direct Connection dengan Timeout:**
   ```
   DATABASE_URL=postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require&connect_timeout=10
   ```

2. **Connection Pooling:**
   ```
   DATABASE_URL=postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:6543/postgres?sslmode=require
   ```

3. **Simple Direct:**
   ```
   DATABASE_URL=postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require
   ```

## Checklist Final

- [ ] `DATABASE_URL` **TANPA quotes** (tidak ada `"` sama sekali)
- [ ] Format: `postgresql+psycopg://...`
- [ ] Password benar: `YGRhLtYar3RVU3ua`
- [ ] SSL: `?sslmode=require`
- [ ] Sudah di-save di Render
- [ ] Service sudah di-redeploy
