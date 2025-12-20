# 🚀 Panduan Migrasi Database: Neon → Supabase

Script ini digunakan untuk memigrasikan semua data dari database Neon ke Supabase.

## 📋 Prerequisites

1. **Python 3.8+** dengan dependencies yang diperlukan
2. **Connection string Neon** (sudah ada di script)
3. **Connection string Supabase** (dari environment variable `DATABASE_URL`)
4. **Database Supabase sudah dibuat** dengan schema yang sama (jalankan migrations terlebih dahulu)

## 🔧 Setup

1. **Pastikan database Supabase sudah memiliki schema yang sama:**
   ```bash
   cd backend
   alembic upgrade head
   ```

2. **Set environment variable untuk Supabase:**
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="postgresql+psycopg://postgres.eeygswpiygbqdztagizv:YOUR_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
   
   # Linux/Mac
   export DATABASE_URL="postgresql+psycopg://postgres.eeygswpiygbqdztagizv:YOUR_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
   ```

   **PENTING:** Gunakan Connection Pooler URL (port 5432) untuk migrasi, bukan direct connection.

3. **Install dependencies (jika belum):**
   ```bash
   pip install sqlalchemy psycopg[binary] python-dotenv
   ```

## 🚀 Menjalankan Migrasi

1. **Masuk ke direktori backend:**
   ```bash
   cd backend
   ```

2. **Jalankan script migrasi:**
   ```bash
   python migrate_neon_to_supabase.py
   ```

3. **Konfirmasi migrasi** ketika diminta (ketik `yes`)

## 📊 Tabel yang Akan Dimigrasi

Script akan memigrasikan tabel dalam urutan berikut (untuk menjaga foreign key constraints):

1. **users** - Data pengguna (pasien, dokter, admin)
2. **doctors** - Data profil dokter
3. **tokens** - Token autentikasi
4. **appointments** - Janji temu
5. **medical_records** - Rekam medis

## ⚠️ Catatan Penting

- **ON CONFLICT DO NOTHING**: Data dengan ID yang sama di Supabase akan di-skip (tidak akan di-overwrite)
- **Sequence Update**: Sequence (auto-increment) akan di-update setelah migrasi
- **Verifikasi**: Script akan memverifikasi jumlah baris setelah migrasi
- **Backup**: Disarankan untuk backup database Supabase sebelum migrasi

## 🔍 Verifikasi Setelah Migrasi

Script akan otomatis memverifikasi jumlah baris di setiap tabel. Pastikan jumlahnya sama antara Neon dan Supabase.

## 🐛 Troubleshooting

### Error: "DATABASE_URL tidak ditemukan"
- Pastikan environment variable `DATABASE_URL` sudah di-set
- Gunakan Connection Pooler URL, bukan direct connection

### Error: "Tabel tidak ditemukan di Supabase"
- Jalankan migrations terlebih dahulu: `alembic upgrade head`
- Pastikan schema sudah dibuat di Supabase

### Error: "Duplicate key" atau "Conflict"
- Ini normal jika data sudah ada di Supabase
- Script menggunakan `ON CONFLICT DO NOTHING` untuk skip duplicates

### Error: "Connection timeout"
- Pastikan menggunakan Connection Pooler URL (port 5432)
- Check firewall/network settings

## 📝 Setelah Migrasi

1. **Update DATABASE_URL di environment variables** (production)
2. **Test aplikasi** untuk memastikan semua berfungsi
3. **Monitor** aplikasi untuk memastikan tidak ada error

