# Fix Supabase Connection - Gunakan Connection Pooler

## Masalah

Supabase free tier **hanya menyediakan IPv6** untuk direct connection (port 5432).

Render adalah **IPv4-only network**, jadi direct connection tidak akan bekerja.

**Error yang terjadi:**
```
connection to server at "2406:da18:243:741c:c48:8709:c950:b1c3", port 5432 failed: Network is unreachable
```

## Solusi: Gunakan Connection Pooler

Supabase Connection Pooler resolve ke **IPv4 address** dan bekerja dengan Render.

### Step 1: Dapatkan Connection Pooler URL

1. **Buka Supabase Dashboard**
2. **Settings → Database**
3. **Scroll ke bagian "Connection Pooling"**
4. **Copy "Connection Pooling" URL** (bukan Direct Connection!)

Format biasanya:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Atau bisa juga menggunakan Transaction Pooler:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true
```

### Step 2: Convert ke Format yang Benar

Connection Pooler URL dari Supabase biasanya format:
```
postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres
```

**Ubah menjadi:**
```
postgresql+psycopg://postgres.xxxxx:YGRhLtYar3RVU3ua@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require
```

**Perubahan:**
- `postgresql://` → `postgresql+psycopg://`
- Tambahkan `?sslmode=require` di akhir
- Pastikan password benar: `YGRhLtYar3RVU3ua`

### Step 3: Set di Render

1. **Render Dashboard → Web Service → Environment**
2. **Edit `DATABASE_URL`**
3. **Paste Connection Pooler URL** (yang sudah di-convert)
4. **Pastikan TANPA quotes**
5. **Save Changes**

## Connection Pooler URL Format

### Session Pooler (Port 6543) - Recommended
```
postgresql+psycopg://postgres.[PROJECT_REF]:YGRhLtYar3RVU3ua@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

### Transaction Pooler (Port 5432 dengan pgbouncer)
```
postgresql+psycopg://postgres.[PROJECT_REF]:YGRhLtYar3RVU3ua@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require
```

**Catatan:**
- `[PROJECT_REF]` = project reference (contoh: `eeygswpiygbqdztagizv`)
- `[REGION]` = region Supabase (contoh: `ap-southeast-1`)
- Password: `YGRhLtYar3RVU3ua`

## Contoh Connection Pooler URL

Berdasarkan project Anda (`eeygswpiygbqdztagizv`), formatnya mungkin:

### Option 1: Session Pooler (Port 6543)
```
postgresql+psycopg://postgres.eeygswpiygbqdztagizv:YGRhLtYar3RVU3ua@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### Option 2: Transaction Pooler (Port 5432)
```
postgresql+psycopg://postgres.eeygswpiygbqdztagizv:YGRhLtYar3RVU3ua@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require
```

**PENTING:** Copy URL langsung dari Supabase Dashboard untuk mendapatkan format yang benar!

## Perbedaan Connection Types

| Type | Port | IPv4 Support | Free Tier |
|------|------|-------------|-----------|
| **Direct Connection** | 5432 | ❌ IPv6 only | ✅ |
| **Session Pooler** | 6543 | ✅ IPv4 | ✅ |
| **Transaction Pooler** | 5432 + pgbouncer | ✅ IPv4 | ✅ |

## Langkah-langkah Lengkap

1. **Buka Supabase Dashboard**
   - https://supabase.com/dashboard
   - Pilih project Anda

2. **Settings → Database**
   - Scroll ke "Connection Pooling"

3. **Copy Connection Pooling URL**
   - Bukan Direct Connection!
   - Format: `postgresql://postgres.xxx:pass@aws-0-region.pooler.supabase.com:6543/postgres`

4. **Convert Format**
   - Ubah `postgresql://` menjadi `postgresql+psycopg://`
   - Tambahkan `?sslmode=require` di akhir
   - Pastikan password benar

5. **Set di Render**
   - Render Dashboard → Environment → `DATABASE_URL`
   - Paste URL (TANPA quotes)
   - Save

6. **Redeploy**
   - Render akan auto-redeploy
   - Check logs untuk konfirmasi

## Checklist

- [ ] Sudah copy Connection Pooler URL dari Supabase Dashboard
- [ ] Sudah convert `postgresql://` menjadi `postgresql+psycopg://`
- [ ] Sudah tambahkan `?sslmode=require`
- [ ] Password benar: `YGRhLtYar3RVU3ua`
- [ ] `DATABASE_URL` TANPA quotes di Render
- [ ] Sudah di-save di Render
- [ ] Service sudah di-redeploy

## Troubleshooting

### Masih Error "Network is unreachable"
- Pastikan menggunakan Connection Pooler URL (bukan Direct Connection)
- Pastikan port 6543 (Session Pooler) atau port 5432 dengan `pgbouncer=true` (Transaction Pooler)
- Check apakah URL dari Supabase Dashboard sudah benar

### Error "Connection refused"
- Pastikan Connection Pooling enabled di Supabase
- Check apakah password benar
- Pastikan format URL benar

### Error "SSL required"
- Pastikan ada `?sslmode=require` di URL
- Atau `&sslmode=require` jika sudah ada parameter lain

## Catatan Penting

- **Direct Connection (port 5432) TIDAK BEKERJA** di Render karena IPv4-only
- **HARUS menggunakan Connection Pooler** untuk Supabase free tier di Render
- Connection Pooler URL berbeda dengan Direct Connection URL
- Connection Pooler resolve ke IPv4, jadi bekerja dengan Render
