# Fix Database Connection Error - Network Unreachable

## Error
```
connection to server at "2406:da18:243:741c:c48:8709:c950:b1c3", port 5432 failed: Network is unreachable
```

## Penyebab
Masih menggunakan **External Database URL** atau format `DATABASE_URL` salah.

## Solusi Pasti

### Step 1: Dapatkan Internal Database URL

1. **Buka Render Dashboard**
2. **Klik PostgreSQL Database** Anda
3. **Klik tab "Connections"**
4. **Copy "Internal Database URL"** (yang penting: **Internal**, bukan External!)

Internal Database URL biasanya terlihat seperti:
```
postgresql://postgres:YGRhLtYar3RVU3ua@dpg-xxxxx-a.singapore-postgres.render.com/dbname
```

### Step 2: Ubah Format

**Ubah dari:**
```
postgresql://postgres:YGRhLtYar3RVU3ua@dpg-xxxxx-a.singapore-postgres.render.com/dbname
```

**Menjadi:**
```
postgresql+psycopg://postgres:YGRhLtYar3RVU3ua@dpg-xxxxx-a.singapore-postgres.render.com/dbname
```

**Yang diubah:**
- `postgresql://` → `postgresql+psycopg://`
- Pastikan password: `YGRhLtYar3RVU3ua`

### Step 3: Set di Environment Variables

1. **Buka Web Service** di Render dashboard
2. **Klik tab "Environment"**
3. **Edit `DATABASE_URL`** (atau Add jika belum ada)
4. **Paste** connection string yang sudah di-format
5. **Save Changes**

### Step 4: Verifikasi

Setelah save, Render akan auto-redeploy. Check logs:
- ✅ Tidak ada error "Network is unreachable"
- ✅ Migration berjalan sukses
- ✅ Health endpoint return OK

## Checklist

Pastikan:
- [ ] Menggunakan **Internal Database URL** (bukan External)
- [ ] Format: `postgresql+psycopg://` (bukan `postgresql://`)
- [ ] Password: `YGRhLtYar3RVU3ua` (case-sensitive)
- [ ] Tidak ada `?sslmode=require` untuk Internal URL
- [ ] `DATABASE_URL` sudah di-update di Environment variables
- [ ] Service sudah di-redeploy

## Perbedaan Internal vs External

| Type | Kapan Digunakan | Format |
|------|----------------|--------|
| **Internal** | Service dan DB di Render yang sama | `postgresql+psycopg://user:pass@host/db` |
| **External** | DB di luar Render atau service lain | `postgresql+psycopg://user:pass@host:5432/db?sslmode=require` |

**Untuk kasus ini, gunakan INTERNAL!**

## Jika Masih Error

1. **Check Database Status:**
   - Pastikan status "Available" (bukan Paused)
   - Jika Paused, klik "Resume"

2. **Check Region:**
   - Pastikan database dan service di region yang sama
   - Contoh: Keduanya di Singapore

3. **Double-check DATABASE_URL:**
   - Pastikan format benar: `postgresql+psycopg://...`
   - Pastikan password benar: `YGRhLtYar3RVU3ua`
   - Pastikan menggunakan Internal URL

4. **Restart Service:**
   - Manual restart dari dashboard
   - Atau tunggu auto-redeploy setelah update env var
