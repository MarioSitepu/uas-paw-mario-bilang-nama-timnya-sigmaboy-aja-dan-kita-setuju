# DATABASE_URL untuk Supabase

## Format Supabase Connection String

Dari Supabase:
```
postgresql://postgres:[YOUR-PASSWORD]@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres
```

## DATABASE_URL yang Benar untuk Render

**Ubah menjadi:**
```
postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require
```

## Perubahan yang Dilakukan

1. **`postgresql://`** → **`postgresql+psycopg://`**
   - Tambahkan `+psycopg` untuk psycopg3 driver

2. **`[YOUR-PASSWORD]`** → **`YGRhLtYar3RVU3ua`**
   - Ganti dengan password yang benar

3. **Tambahkan `?sslmode=require`**
   - Supabase memerlukan SSL connection
   - Tambahkan di akhir connection string

## Langkah-langkah

1. **Copy connection string ini:**
   ```
   postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require
   ```

2. **Buka Render Dashboard:**
   - Web Service → Environment tab

3. **Set DATABASE_URL:**
   - Edit atau Add `DATABASE_URL`
   - Paste connection string di atas
   - Save Changes

4. **Tunggu auto-redeploy**

## Format Lengkap

```
postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require
```

**Komponen:**
- Protocol: `postgresql+psycopg://`
- Username: `postgres`
- Password: `YGRhLtYar3RVU3ua`
- Host: `db.eeygswpiygbqdztagizv.supabase.co`
- Port: `5432`
- Database: `postgres`
- SSL: `?sslmode=require`

## Verifikasi

Setelah set `DATABASE_URL`, check logs:
- ✅ Tidak ada error "Network is unreachable"
- ✅ Tidak ada error "SSL connection required"
- ✅ Migration berjalan sukses
- ✅ Health endpoint return OK

## Troubleshooting

### Error "SSL connection required"

**Solusi:**
- Pastikan ada `?sslmode=require` di akhir connection string
- Supabase memerlukan SSL connection

### Error "Network is unreachable"

**Solusi:**
- Pastikan format benar: `postgresql+psycopg://...`
- Pastikan host benar: `db.eeygswpiygbqdztagizv.supabase.co`
- Pastikan port: `5432`

### Error "password authentication failed"

**Solusi:**
- Pastikan password benar: `YGRhLtYar3RVU3ua`
- Check password di Supabase dashboard (Settings → Database)
