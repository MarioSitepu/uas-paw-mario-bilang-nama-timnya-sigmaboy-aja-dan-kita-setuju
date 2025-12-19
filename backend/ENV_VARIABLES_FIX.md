# Fix Environment Variables di Render

## Environment Variables yang Diberikan

```
CORS_ORIGINS=https://mario-bilang-nama-timnya-sigmaboy-a.vercel.app/
DATABASE_URL="postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require"
PORT=10000
SESSION_SECRET=zd9FMvFp0vXblMwwyGyS1eNBAMY5p5tzGOmYE_UX9OYzcPfHASdbDYGxGsvMBG6n
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleWdzd3BpeWdicWR6dGFnaXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA2MDI3NywiZXhwIjoyMDgxNjM2Mjc3fQ.NPfVfa7JHm2l-ReUakGAP7Fz9f6y-ApS59p-Jdpd3gs
SUPABASE_URL=https://eeygswpiygbqdztagizv.supabase.co
```

## Masalah yang Ditemukan

### 1. DATABASE_URL - Ada Quotes
**Masalah:** Ada quotes `"` di awal dan akhir
```
DATABASE_URL="postgresql+psycopg://..."
```
**Masalah:** Quotes akan menjadi bagian dari value, menyebabkan connection string salah.

**Perbaikan:** Hapus quotes
```
DATABASE_URL=postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require
```

### 2. CORS_ORIGINS - Ada Trailing Slash
**Masalah:** Ada trailing slash `/` di akhir
```
CORS_ORIGINS=https://mario-bilang-nama-timnya-sigmaboy-a.vercel.app/
```
**Masalah:** Trailing slash bisa menyebabkan CORS matching issue.

**Perbaikan:** Hapus trailing slash
```
CORS_ORIGINS=https://mario-bilang-nama-timnya-sigmaboy-a.vercel.app
```

## Environment Variables yang Benar

Set di Render Dashboard (tanpa quotes, tanpa trailing slash):

```
CORS_ORIGINS=https://mario-bilang-nama-timnya-sigmaboy-a.vercel.app
DATABASE_URL=postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require
PORT=10000
SESSION_SECRET=zd9FMvFp0vXblMwwyGyS1eNBAMY5p5tzGOmYE_UX9OYzcPfHASdbDYGxGsvMBG6n
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleWdzd3BpeWdicWR6dGFnaXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA2MDI3NywiZXhwIjoyMDgxNjM2Mjc3fQ.NPfVfa7JHm2l-ReUakGAP7Fz9f6y-ApS59p-Jdpd3gs
SUPABASE_URL=https://eeygswpiygbqdztagizv.supabase.co
```

## Langkah-langkah Perbaikan

### 1. Fix DATABASE_URL
1. Buka Render Dashboard → Web Service → Environment
2. Edit `DATABASE_URL`
3. **Hapus quotes** di awal dan akhir
4. Value harus:
   ```
   postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require
   ```
5. Save Changes

### 2. Fix CORS_ORIGINS
1. Edit `CORS_ORIGINS`
2. **Hapus trailing slash** `/` di akhir
3. Value harus:
   ```
   https://mario-bilang-nama-timnya-sigmaboy-a.vercel.app
   ```
4. Save Changes

### 3. Verifikasi Lainnya
- `PORT=10000` ✅ (sudah benar)
- `SESSION_SECRET` ✅ (sudah benar)
- `SUPABASE_KEY` ✅ (sudah benar)
- `SUPABASE_URL` ✅ (sudah benar)

## Format yang Benar

### DATABASE_URL
```
postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@db.eeygswpiygbqdztagizv.supabase.co:5432/postgres?sslmode=require
```
**TANPA quotes!**

### CORS_ORIGINS
```
https://mario-bilang-nama-timnya-sigmaboy-a.vercel.app
```
**TANPA trailing slash!**

## Checklist

Setelah perbaikan:
- [ ] `DATABASE_URL` tanpa quotes
- [ ] `CORS_ORIGINS` tanpa trailing slash
- [ ] Semua environment variables sudah di-update
- [ ] Service sudah di-redeploy
- [ ] Check logs - tidak ada error connection

## Setelah Fix

Setelah memperbaiki kedua environment variables ini:
1. Render akan auto-redeploy
2. Database connection seharusnya berhasil
3. CORS seharusnya bekerja dengan benar
