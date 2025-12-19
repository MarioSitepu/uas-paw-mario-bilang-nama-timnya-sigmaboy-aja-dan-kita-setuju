# Cara Membuat DATABASE_URL dengan Password

Password yang diberikan: `YGRhLtYar3RVU3ua`

## Format DATABASE_URL

```
postgresql+psycopg://USERNAME:PASSWORD@HOST/DATABASE
```

## Informasi yang Diperlukan

Untuk membuat `DATABASE_URL` lengkap, Anda perlu:

1. **Username** - Biasanya sama dengan database name atau `postgres`
2. **Password** - Sudah ada: `YGRhLtYar3RVU3ua`
3. **Host** - Dari Render PostgreSQL dashboard (tab Connections)
4. **Database name** - Nama database Anda

## Cara Mendapatkan Informasi Lengkap

### Di Render Dashboard:

1. Buka **PostgreSQL Database** di Render dashboard
2. Klik tab **"Connections"**
3. Lihat **"Internal Database URL"** - akan terlihat seperti:
   ```
   postgresql://username:password@host/database
   ```
4. Copy semua informasi dari sana

### Atau Manual:

Jika sudah tahu informasi:
- **Username**: Biasanya `postgres` atau nama database
- **Password**: `YGRhLtYar3RVU3ua`
- **Host**: Dari Internal Database URL (contoh: `dpg-xxxxx-a.singapore-postgres.render.com`)
- **Database**: Nama database Anda

## Contoh DATABASE_URL

Jika informasi lengkapnya:
- Username: `postgres`
- Password: `YGRhLtYar3RVU3ua`
- Host: `dpg-xxxxx-a.singapore-postgres.render.com`
- Database: `dbname`

Maka `DATABASE_URL`:
```
postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@dpg-xxxxx-a.singapore-postgres.render.com/dbname
```

## Langkah-langkah

1. **Buka PostgreSQL Database** di Render dashboard
2. **Klik tab "Connections"**
3. **Copy "Internal Database URL"** lengkap
4. **Ubah format:**
   - Jika `postgresql://` → ubah menjadi `postgresql+psycopg://`
   - Pastikan password sudah benar: `YGRhLtYar3RVU3ua`
5. **Set di Web Service:**
   - Environment tab → Edit `DATABASE_URL`
   - Paste connection string
   - Save Changes

## PENTING

- Gunakan **Internal Database URL** (bukan External)
- Format harus: `postgresql+psycopg://` (bukan `postgresql://`)
- Password: `YGRhLtYar3RVU3ua` (case-sensitive!)

