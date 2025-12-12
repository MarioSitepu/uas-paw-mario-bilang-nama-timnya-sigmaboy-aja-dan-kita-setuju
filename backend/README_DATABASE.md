# Setup Database Neon PostgreSQL

## Langkah-langkah Setup

### 1. Dapatkan Connection String dari Neon

1. Login ke [Neon Console](https://console.neon.tech)
2. Pilih project Anda
3. Klik pada database yang ingin digunakan
4. Copy connection string yang tersedia
5. Format connection string biasanya seperti:
   ```
   postgresql://user:password@host/database?sslmode=require
   ```

### 2. Konfigurasi Connection String

Anda bisa menggunakan salah satu cara berikut:

#### Opsi A: Menggunakan Environment Variable (Recommended)

1. Buat file `.env` di folder `backend/`:
   ```bash
   # Di terminal
   cd backend
   echo DATABASE_URL=postgresql://user:password@host/database?sslmode=require > .env
   ```

2. Atau edit file `development.ini` dan ganti baris:
   ```ini
   sqlalchemy.url = postgresql://user:password@host/database?sslmode=require
   ```
   dengan connection string dari Neon Anda.

#### Opsi B: Langsung di development.ini

Edit file `backend/development.ini` dan ganti:
```ini
sqlalchemy.url = postgresql://user:password@host/database?sslmode=require
```

Dengan connection string dari Neon dashboard Anda.

### 3. Install Dependencies

Dependencies sudah terinstall, tapi jika perlu install ulang:
```bash
pip install -r requirements.txt
```

### 4. Test Koneksi

Jalankan server untuk test koneksi:
```bash
cd backend
pserve development.ini
```

Jika tidak ada error, berarti koneksi berhasil!

### 5. Setup Database Schema (Opsional)

Jika ingin membuat tabel dari model yang ada:
```bash
cd backend
alembic init alembic  # Jika belum ada
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Catatan

- File `.env` sudah di-ignore oleh git (aman untuk menyimpan credentials)
- Connection string dari Neon biasanya sudah include SSL mode
- Pastikan connection string tidak di-commit ke git repository

