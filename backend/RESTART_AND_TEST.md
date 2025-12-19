# RESTART SERVER DAN TEST

## Masalah
POST request ke `/api/auth/login` mengembalikan 500 error TANPA CORS headers, menyebabkan CORS error di browser.

## Solusi yang Sudah Diterapkan
1. ✅ WSGI wrapper untuk menambahkan CORS headers ke SEMUA responses
2. ✅ CORS tween untuk menangkap semua exceptions
3. ✅ Exception view untuk handle semua exceptions
4. ✅ Error handling yang lebih robust di login function

## LANGKAH-LANGKAH:

### 1. STOP SERVER
Tekan `Ctrl+C` di terminal dimana server berjalan

### 2. RESTART SERVER
```bash
cd backend
python -m pyramid.scripts.pserve development.ini --reload
```

### 3. TUNGGU SAMPAI SERVER START
Anda akan melihat:
```
Starting server in PID XXXXX
2025-XX-XX XX:XX:XX,XXX INFO  [waitress:449][log_info()] Serving on http://127.0.0.1:6543
[MAIN] Creating WSGI wrapper - this should appear when server starts
```

### 4. TEST
Di terminal lain, jalankan:
```bash
cd backend
python test_server.py
```

### 5. CEK LOG SERVER
Saat test dijalankan, Anda HARUS melihat log seperti:
- `[WSGI WRAPPER] WRAPPER CALLED` - untuk SETIAP request
- `[CORS TWEEN] Processing POST /api/auth/login` - untuk POST request
- `[WSGI WRAPPER] start_response called` - saat response dikirim

### 6. JIKA MASIH ERROR
Jika masih error, copy log dari server terminal dan kirim ke saya. Log akan menunjukkan:
- Apakah wrapper dipanggil
- Error apa yang terjadi
- Dimana error terjadi

## CATATAN PENTING
- Server HARUS di-restart setelah perubahan code
- Log akan muncul di terminal dimana server berjalan (bukan di test script)
- Jika tidak ada log sama sekali, berarti server belum menggunakan code baru
