# Fix Google OAuth & CORS Issues

## Issue 1: Google OAuth Origin Not Allowed

**Error:** "The given origin is not allowed for the given client ID"

**Penyebab:** `localhost:5173` belum terdaftar di Google Cloud Console

### **Solusi:**

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda (primeval-node-477904-k3)
3. Navigate ke **APIs & Services** > **Credentials**
4. Cari **OAuth 2.0 Client ID** yang sudah Anda buat
5. Klik untuk edit credential tersebut
6. Di bagian **Authorized JavaScript origins**, tambahkan jika belum ada:
   ```
   http://localhost:5173
   http://localhost:5174
   ```
7. Di bagian **Authorized redirect URIs**, tambahkan jika belum ada:
   ```
   http://localhost:5173
   http://localhost:5174
   ```
8. **Klik SAVE**

> **Catatan:** Jika pakai port berbeda, tambahkan sesuai port yang running

### **Verify:**
- Refresh browser
- Coba Google login lagi
- Seharusnya tidak ada error "origin is not allowed"

---

## Issue 2: CORS Headers (✅ FIXED - Updated)

**Perbaikan yang sudah dilakukan:**
- ✅ Updated backend CORS tween dengan origin-specific handling
- ✅ Handle OPTIONS preflight request dengan benar
- ✅ Add Content-Type, Authorization, Accept headers support
- ✅ Server sekarang listen di `127.0.0.1:6543` (match dengan frontend)
- ✅ Support untuk `localhost:5173` dan `127.0.0.1:5173`

**PENTING: Restart Backend Server!**
Setelah perubahan ini, **WAJIB restart backend server** agar perubahan berlaku:
```bash
# Stop server yang sedang running (Ctrl+C)
# Kemudian start lagi:
cd backend
python -m pyramid.scripts.pserve development.ini
```

**Testing:**
1. Cek browser DevTools **Network tab**
2. Lihat response dari `/api/auth/login`
3. Seharusnya ada header: `Access-Control-Allow-Origin: http://localhost:5173` atau `http://127.0.0.1:5173`
4. Tidak ada error "CORS policy" di console

---

## Testing Steps

1. **Backend:** Pastikan running di port 6543
   ```bash
   python -m pyramid.scripts.pserve development.ini
   ```

2. **Frontend:** Pastikan running di port 5173
   ```bash
   npm run dev
   ```

3. **Browser Console (F12):**
   - Tidak ada error "CORS policy"
   - Tidak ada error "origin is not allowed"

4. **Test Google Login:**
   - Buka http://localhost:5173/login
   - Klik "Sign in with Google"
   - Seharusnya berhasil atau minimal tidak ada Google origin error

---

## Quick Checklist

- [ ] Backend running pada port 6543
- [ ] Frontend running pada port 5173
- [ ] Google Cloud Console updated dengan authorized origins
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Browser console tidak ada error
- [ ] Google login button bisa diklik
