# Deploy ke Render - Panduan Lengkap

## Langkah-langkah Deployment ke Render

### 1. Persiapan

Pastikan repository sudah di-push ke GitHub.

### 2. Create Web Service di Render

1. Login ke [Render Dashboard](https://dashboard.render.com)
2. Klik **"New +"** → **"Web Service"**
3. Connect GitHub repository Anda
4. Pilih repository yang berisi backend

### 3. Konfigurasi Service

#### Basic Settings:
- **Name**: `backend-api` (atau nama lain)
- **Environment**: `Python 3`
- **Region**: Pilih region terdekat (Singapore untuk Indonesia)
- **Branch**: `main` atau branch yang ingin di-deploy

#### Build & Deploy:
- **Build Command**: 
  ```bash
  pip install -r requirements.txt && pip install -e . && alembic upgrade head
  ```
- **Start Command**: 
  ```bash
  python -m pyramid.scripts.pserve production.ini
  ```

#### Advanced Settings:
- **Health Check Path**: `/health`
- **Auto-Deploy**: `Yes` (untuk auto-deploy dari git push)

### 4. Environment Variables

Set environment variables berikut di Render dashboard:

#### Required:
1. **DATABASE_URL**
   - Bisa create PostgreSQL database di Render (New → PostgreSQL)
   - Atau gunakan database eksternal (Neon, Supabase, dll)
   - Format: `postgresql+psycopg://user:password@host/database?sslmode=require`

2. **SESSION_SECRET**
   - Generate dengan: `python generate_secret.py`
   - Atau biarkan Render generate (pilih "Generate" di Render)
   - Minimum 32 characters

3. **CORS_ORIGINS**
   - Frontend domain(s) yang diizinkan
   - Contoh: `https://yourdomain.com,https://www.yourdomain.com`
   - Untuk development: `http://localhost:5173,http://localhost:5174`

#### Optional:
- **PORT**: Render akan set otomatis ke `10000` (tidak perlu set manual)
- **PYTHON_VERSION**: `3.11.0` (optional, Render akan detect otomatis)

### 5. Create Database (Jika belum ada)

1. Di Render dashboard, klik **"New +"** → **"PostgreSQL"**
2. Pilih plan (Free tier tersedia)
3. Set name dan region
4. Copy connection string ke `DATABASE_URL` environment variable

### 6. Deploy

1. Klik **"Create Web Service"**
2. Render akan:
   - Clone repository
   - Install dependencies
   - Run migrations
   - Start server
3. Tunggu sampai build selesai (biasanya 2-5 menit)
4. Service akan available di URL: `https://your-service-name.onrender.com`

### 7. Verifikasi Deployment

Test health endpoint:
```bash
curl https://your-service-name.onrender.com/health
```

Harus return:
```json
{"status": "ok", "message": "Backend is running"}
```

## Troubleshooting

### Build Fails

- Check logs di Render dashboard
- Pastikan `requirements.txt` lengkap
- Pastikan Python version compatible (3.11+)

### Database Connection Error

- Pastikan `DATABASE_URL` format benar
- Pastikan database accessible dari Render
- Check SSL mode jika menggunakan cloud database

### CORS Errors

- Pastikan `CORS_ORIGINS` sudah diset dengan benar
- Include protocol (https://) di origins
- Check browser console untuk error detail

### Port Issues

- Render menggunakan port `10000` secara default
- Kode sudah dikonfigurasi untuk membaca `PORT` dari environment
- Tidak perlu set `PORT` manual di Render

### Migrations Not Running

- Pastikan `alembic upgrade head` ada di build command
- Check logs untuk error migrations
- Bisa run manual via Render shell: `alembic upgrade head`

## Update Deployment

Setelah update code:
1. Push ke GitHub
2. Render akan auto-deploy (jika Auto-Deploy enabled)
3. Atau manual deploy dari dashboard

## Monitoring

- **Logs**: View real-time logs di Render dashboard
- **Metrics**: Monitor CPU, Memory, Request count
- **Health**: Render akan monitor `/health` endpoint

## Free Tier Limitations

- Service akan sleep setelah 15 menit tidak aktif
- First request setelah sleep akan lambat (cold start)
- Upgrade ke paid plan untuk always-on service

## Cost Optimization

- Gunakan Free tier untuk development/testing
- Upgrade ke Starter ($7/month) untuk production
- Monitor usage di dashboard

## Next Steps

1. ✅ Deploy backend ke Render
2. ✅ Test semua endpoints
3. ✅ Update frontend dengan backend URL production
4. ✅ Setup monitoring/alerting
5. ✅ Configure custom domain (optional)

## Support

Jika ada masalah:
- Check Render logs
- Check Render documentation: https://render.com/docs
- Contact Render support
