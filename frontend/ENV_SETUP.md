# Environment Variables Setup

## File .env

Buat file `.env` di folder `frontend/` dengan isi berikut:

```env
# Google OAuth Client ID
# Dapatkan dari Google Cloud Console: https://console.cloud.google.com/
# Buat OAuth 2.0 Client ID di APIs & Services > Credentials
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com

# API Base URL (Backend)
# URL backend Pyramid Anda
VITE_API_URL=http://localhost:6543
```

## Cara Mendapatkan Google OAuth Client ID

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih atau buat project baru
3. Navigate ke **APIs & Services** > **Credentials**
4. Klik **Create Credentials** > **OAuth 2.0 Client ID**
5. Pilih application type: **Web application**
6. Tambahkan **Authorized JavaScript origins**:
   - `http://localhost:5173` (untuk development)
   - `https://yourdomain.com` (untuk production)
7. Copy **Client ID** dan paste ke `VITE_GOOGLE_CLIENT_ID` di file `.env`

## Catatan

- File `.env` sudah di-ignore oleh git (aman untuk menyimpan credentials)
- Jangan commit file `.env` ke repository
- Setelah membuat file `.env`, restart dev server (`npm run dev`)
- Di Vite, semua environment variables yang bisa diakses di client-side harus dimulai dengan `VITE_`

