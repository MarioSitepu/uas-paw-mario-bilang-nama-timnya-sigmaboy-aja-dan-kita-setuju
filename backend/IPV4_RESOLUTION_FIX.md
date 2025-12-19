# Fix IPv4 Resolution untuk Supabase

## Error yang Terjadi
```
connection to server at "2406:da18:243:741c:c48:8709:c950:b1c3", port 5432 failed: Network is unreachable
```

## Penyebab
Error ini terjadi karena:
1. **Hostname di-resolve ke IPv6** - `db.eeygswpiygbqdztagizv.supabase.co` di-resolve ke IPv6 address `2406:da18:243:741c:c48:8709:c950:b1c3`
2. **IPv6 tidak accessible** dari Render network
3. **Perlu force IPv4 resolution** di Python code

## Solusi yang Diterapkan

Kode sekarang **otomatis resolve hostname ke IPv4** sebelum membuat connection:

1. **Deteksi Supabase connection** (`supabase.co` dalam URL)
2. **Resolve hostname ke IPv4** menggunakan `socket.getaddrinfo()` dengan `AF_INET`
3. **Replace hostname dengan IPv4 address** di connection string
4. **Auto-add connection parameters** (`connect_timeout`, `sslmode=require`)

## Kode yang Diperbaiki

### `backend/app/__init__.py`
- Auto-resolve Supabase hostname ke IPv4
- Replace hostname dengan IPv4 address
- Log resolution untuk debugging

### `backend/alembic/env.py`
- Same IPv4 resolution untuk Alembic migrations
- Ensure migrations juga menggunakan IPv4

## Langkah-langkah

1. **Push kode terbaru** (sudah di-commit dengan IPv4 resolution)
2. **Render Dashboard → Environment → Pastikan `DATABASE_URL` TANPA quotes**
3. **Value `DATABASE_URL`:**
   ```
   postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require
   ```
4. **Save Changes**
5. **Tunggu auto-redeploy**

## Bagaimana Cara Kerjanya

1. Aplikasi membaca `DATABASE_URL` dari environment
2. Deteksi jika URL mengandung `supabase.co`
3. Extract hostname dari URL (`db.eeygswpiygbqdztagizv.supabase.co`)
4. Resolve hostname ke IPv4 menggunakan `socket.getaddrinfo(hostname, None, socket.AF_INET, ...)`
5. Replace hostname dengan IPv4 address di connection string
6. Connection dibuat menggunakan IPv4 address langsung

**Contoh:**
- **Sebelum:** `postgresql+psycopg://postgres:pass@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres`
- **Sesudah:** `postgresql+psycopg://postgres:pass@[IPv4_ADDRESS]:5432/postgres`

## Keuntungan

- ✅ **Tidak perlu manual resolve** - Otomatis di code
- ✅ **Bekerja untuk semua Supabase connections** - App dan Alembic
- ✅ **Debug logging** - Bisa lihat IPv4 address yang digunakan
- ✅ **Fallback graceful** - Jika resolve gagal, tetap gunakan hostname

## Checklist

- [ ] Kode sudah di-push ke GitHub
- [ ] `DATABASE_URL` **TANPA quotes**
- [ ] `DATABASE_URL` menggunakan format: `postgresql+psycopg://...`
- [ ] Sudah di-save di Render
- [ ] Service sudah di-redeploy
- [ ] Check logs untuk melihat IPv4 resolution

## Debug Logs

Setelah deploy, check Render logs untuk melihat:
```
[MAIN] Resolved db.eeygswpiygbqdztagizv.supabase.co to IPv4: [IP_ADDRESS]
[MAIN] Using IPv4 connection string
```

Jika ada warning:
```
[MAIN] Warning: Could not resolve to IPv4: [error]
```
Ini berarti resolve gagal, tapi aplikasi tetap akan mencoba dengan hostname.

## Jika Masih Error

### Check 1: Verifikasi Logs
- Check Render logs untuk IPv4 resolution
- Pastikan tidak ada error saat resolve

### Check 2: Test Connection
Coba test dari local machine:
```bash
python -c "import socket; print(socket.getaddrinfo('db.eeygswpiygbqdztagizv.supabase.co', None, socket.AF_INET)[0][4][0])"
```

### Check 3: Supabase Status
- Pastikan Supabase database active
- Check jika ada IP restrictions
