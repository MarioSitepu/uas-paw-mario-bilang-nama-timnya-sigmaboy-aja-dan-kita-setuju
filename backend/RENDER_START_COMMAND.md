# Update Start Command di Render

## Masalah

Server masih berjalan di port 6543, padahal Render mengharapkan port 10000.

**Log menunjukkan:**
```
==> Running 'python -m pyramid.scripts.pserve production.ini'
Serving on http://0.0.0.0:6543
```

## Solusi

Update **Start Command** di Render Dashboard untuk menggunakan `start_server.py`.

## Langkah-langkah

1. **Buka Render Dashboard**
   - https://dashboard.render.com
   - Pilih Web Service Anda

2. **Settings → Start Command**
   - Edit Start Command
   - Ganti dari:
     ```
     python -m pyramid.scripts.pserve production.ini
     ```
   - Menjadi:
     ```
     python start_server.py
     ```
   - **PENTING:** Pastikan path benar - jika service root di `backend/`, gunakan:
     ```
     cd backend && python start_server.py
     ```
   - Atau jika service root di project root:
     ```
     python backend/start_server.py
     ```

3. **Save Changes**
   - Render akan auto-redeploy

4. **Verifikasi**
   - Check logs untuk melihat:
     ```
     [START_SERVER] Starting server on port 10000 (from PORT env var)
     Serving on http://0.0.0.0:10000
     ```

## Alternative: Manual Command

Jika `start_server.py` tidak bekerja, gunakan command langsung:

```
python -m pyramid.scripts.pserve production.ini --listen=*:${PORT:-10000}
```

Atau jika Render tidak support `${PORT}`:

```
python -m pyramid.scripts.pserve production.ini --listen=*:10000
```

## Checklist

- [ ] Start Command sudah di-update di Render Dashboard
- [ ] Menggunakan `python start_server.py` atau command dengan `--listen=*:10000`
- [ ] PORT environment variable sudah set (Render set otomatis ke 10000)
- [ ] Service sudah di-redeploy
- [ ] Check logs untuk konfirmasi port 10000

## Troubleshooting

### Masih Error "Port scan timeout"
- Pastikan Start Command benar
- Pastikan menggunakan `--listen=*:10000` atau `start_server.py`
- Check logs untuk melihat port yang digunakan

### Error "Module not found: start_server"
- Pastikan path benar
- Jika service root di `backend/`, gunakan: `python start_server.py`
- Jika service root di project root, gunakan: `python backend/start_server.py`
