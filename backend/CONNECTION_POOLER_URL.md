# Connection Pooler URL untuk Render

## URL dari Supabase Dashboard

```
postgresql://postgres.eeygswpiygbqdztagizv:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

## Format yang Benar untuk Render

**Ganti `[YOUR-PASSWORD]` dengan password Anda dan convert format:**

```
postgresql+psycopg://postgres.eeygswpiygbqdztagizv:YGRhLtYar3RVU3ua@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

## Perubahan yang Dibutuhkan

1. **Replace `[YOUR-PASSWORD]`** → `YGRhLtYar3RVU3ua`
2. **Convert `postgresql://`** → `postgresql+psycopg://`
3. **Tambahkan `?sslmode=require`** di akhir

## Set di Render

1. **Render Dashboard → Web Service → Environment**
2. **Edit `DATABASE_URL`**
3. **Paste URL berikut (TANPA quotes):**

```
postgresql+psycopg://postgres.eeygswpiygbqdztagizv:YGRhLtYar3RVU3ua@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

4. **Save Changes**
5. **Tunggu auto-redeploy**

## Catatan

- ✅ **IPv4 compatible** - Session pooler connections are IPv4 proxied for free
- ✅ **Port 5432** - Ini adalah Session Pooler (bukan Direct Connection)
- ✅ **Bekerja dengan Render** - Karena IPv4 proxied

## Checklist

- [ ] Password sudah di-replace: `YGRhLtYar3RVU3ua`
- [ ] Format sudah di-convert: `postgresql+psycopg://`
- [ ] Sudah tambahkan: `?sslmode=require`
- [ ] `DATABASE_URL` TANPA quotes di Render
- [ ] Sudah di-save di Render
- [ ] Service sudah di-redeploy
