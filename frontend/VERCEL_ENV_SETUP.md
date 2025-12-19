# Environment Variables untuk Frontend (Vercel)

## Environment Variables yang Diperlukan

Frontend menggunakan Vite, jadi semua environment variables harus diawali dengan `VITE_`.

### 1. VITE_API_URL

**Deskripsi:** URL backend API (Render deployment)

**Format:**
```
VITE_API_URL=https://your-backend-service.onrender.com
```

**Contoh:**
```
VITE_API_URL=https://mario-bilang-nama-timnya-sigmaboy-a.onrender.com
```

**Default (untuk development):**
```
http://127.0.0.1:6543
```

## Cara Setup di Vercel

1. **Buka Vercel Dashboard**
   - https://vercel.com/dashboard
   - Pilih project Anda

2. **Settings → Environment Variables**
   - Klik "Add New"
   - Name: `VITE_API_URL`
   - Value: URL backend Render Anda (contoh: `https://mario-bilang-nama-timnya-sigmaboy-a.onrender.com`)
   - Environment: Pilih semua (Production, Preview, Development)
   - Klik "Save"

3. **Redeploy**
   - Setelah menambahkan environment variable, Vercel akan otomatis redeploy
   - Atau klik "Redeploy" manual di Deployments

## Verifikasi

Setelah deploy, cek di browser console:
- Frontend seharusnya memanggil API ke URL yang benar
- Tidak ada CORS errors
- API requests berhasil

## Troubleshooting

### Masih menggunakan localhost
- Pastikan environment variable sudah di-set di Vercel
- Pastikan sudah redeploy setelah menambahkan env var
- Clear browser cache

### CORS Errors
- Pastikan `CORS_ORIGINS` di backend (Render) sudah include URL frontend Vercel
- Format: `https://your-frontend.vercel.app`

### API tidak terhubung
- Check network tab di browser DevTools
- Pastikan `VITE_API_URL` benar
- Pastikan backend sudah live dan accessible
