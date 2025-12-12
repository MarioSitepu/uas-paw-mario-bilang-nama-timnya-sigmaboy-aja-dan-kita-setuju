# Cara Setup Environment Variable untuk Neon Database

## Masalah dengan PowerShell

Di PowerShell, karakter `&` adalah operator khusus. Jadi kita perlu cara khusus untuk membuat file `.env`.

## Cara yang Benar (PowerShell)

### Opsi 1: Menggunakan Set-Content (Recommended)

```powershell
cd backend
Set-Content -Path .env -Value "DATABASE_URL=postgresql://user:password@host/database?sslmode=require&channel_binding=require"
```

**Ganti `postgresql://user:password@host/database?sslmode=require&channel_binding=require` dengan connection string asli dari Neon Anda.**

### Opsi 2: Menggunakan Here-String

```powershell
cd backend
@"
DATABASE_URL=postgresql://user:password@host/database?sslmode=require&channel_binding=require
"@ | Out-File -FilePath .env -Encoding utf8
```

### Opsi 3: Menggunakan Notepad (Paling Mudah)

1. Buka Notepad
2. Ketik:
   ```
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require&channel_binding=require
   ```
3. Save As dengan nama `.env` di folder `backend/`
4. Pastikan "Save as type" diubah ke "All Files (*.*)"
5. Encoding: UTF-8

### Opsi 4: Langsung Edit development.ini

Jika lebih mudah, edit file `backend/development.ini` dan ganti baris:
```ini
sqlalchemy.url = postgresql://user:password@host/database?sslmode=require
```

Dengan connection string dari Neon Anda (bisa langsung paste, tidak perlu escape).

## Verifikasi

Setelah membuat file `.env`, verifikasi dengan:
```powershell
Get-Content .env
```

Atau test koneksi:
```powershell
pserve development.ini
```

## Catatan

- File `.env` sudah di-ignore oleh git (aman)
- Jangan commit connection string ke repository
- Connection string dari Neon biasanya sudah include parameter SSL
- Kode akan otomatis mengkonversi `postgresql://` ke `postgresql+psycopg://` untuk menggunakan psycopg3
- Anda bisa menggunakan format `postgresql://` atau `postgresql+psycopg://` - keduanya akan bekerja

