# Fix Database Connection Error di Render

## Error yang Terjadi

```
connection to server at "2406:da18:243:741c:c48:8709:c950:b1c3", port 5432 failed: Network is unreachable
```

## Penyebab

Error ini terjadi karena:
1. **Menggunakan External Database URL** padahal seharusnya **Internal Database URL**
2. Atau format `DATABASE_URL` tidak benar
3. Atau database tidak accessible dari service

## Solusi

### Option 1: Gunakan Internal Database URL (Recommended)

Jika database PostgreSQL dan Web Service berada di **Render yang sama**:

1. Buka **PostgreSQL Database** di Render dashboard
2. Klik tab **"Connections"**
3. Copy **"Internal Database URL"** (bukan External!)
4. Format akan seperti:
   ```
   postgresql://user:password@dpg-xxxxx-a/dbname
   ```
5. **Ubah format** menjadi:
   ```
   postgresql+psycopg://user:password@dpg-xxxxx-a/dbname
   ```
   (Tambahkan `+psycopg` setelah `postgresql`)

6. Set di Web Service → Environment → `DATABASE_URL`

**Perbedaan:**
- **Internal Database URL**: Untuk service di Render yang sama (lebih cepat, lebih aman)
- **External Database URL**: Untuk koneksi dari luar Render (perlu whitelist IP)

### Option 2: Jika Database di Render Lain atau Eksternal

Jika database di tempat lain (Neon, Supabase, dll):

1. Pastikan format benar: `postgresql+psycopg://...`
2. Pastikan SSL mode: `?sslmode=require`
3. Pastikan database accessible dari Render
4. Check firewall/whitelist settings

### Option 3: Check Database Status

1. Buka PostgreSQL Database di Render dashboard
2. Pastikan status **"Available"** (bukan "Paused" atau "Stopped")
3. Jika paused, klik **"Resume"**

## Format DATABASE_URL yang Benar

### Untuk Internal Database (Recommended)
```
postgresql+psycopg://user:password@dpg-xxxxx-a.singapore-postgres.render.com/dbname
```

### Untuk External Database
```
postgresql+psycopg://user:password@host:5432/dbname?sslmode=require
```

**PENTING:**
- Harus menggunakan `postgresql+psycopg://` (bukan `postgresql://`)
- Internal URL tidak perlu `?sslmode=require`
- External URL perlu `?sslmode=require`

## Langkah-langkah Fix

1. **Buka PostgreSQL Database** di Render dashboard
2. **Copy Internal Database URL** dari tab Connections
3. **Ubah format:**
   - Jika `postgresql://` → ubah menjadi `postgresql+psycopg://`
   - Jika sudah `postgresql+psycopg://` → langsung pakai
4. **Set di Web Service:**
   - Environment tab → Edit `DATABASE_URL`
   - Paste connection string yang sudah di-format
   - Save Changes
5. **Redeploy** service (akan auto-redeploy setelah save)

## Verifikasi

Setelah fix, check logs:
- Tidak ada error "Network is unreachable"
- Tidak ada error "connection is bad"
- Migration berjalan sukses
- Health endpoint return OK

## Troubleshooting

### Masih Error "Network is unreachable"

**Solusi:**
- Pastikan menggunakan **Internal Database URL**
- Pastikan database dan service di **region yang sama**
- Check database status (harus Available)

### Error "connection is bad"

**Solusi:**
- Check format `DATABASE_URL` benar
- Pastikan menggunakan `postgresql+psycopg://`
- Restart service setelah update environment variable

### Migration Error

**Solusi:**
- Pastikan database connection berhasil dulu
- Check logs untuk error detail
- Pastikan migration files tidak ada conflict

