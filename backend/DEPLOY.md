# Deployment Guide

Backend API siap untuk deployment ke berbagai platform.

## Prerequisites

- Python 3.11+
- PostgreSQL database (Neon, Supabase, atau database PostgreSQL lainnya)
- Environment variables configured

## Environment Variables

Buat file `.env` di root backend atau set environment variables:

```bash
DATABASE_URL=postgresql+psycopg://user:password@host/database?sslmode=require
SESSION_SECRET=your-very-secret-key-here-minimum-32-characters
PORT=6543  # Optional, default 6543
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com  # Comma-separated
```

Atau copy dari example:
```bash
cp env.example .env
# Edit .env dengan konfigurasi Anda
```

Generate session secret:
```bash
python generate_secret.py
```

### Database URL Format

- **Neon PostgreSQL**: `postgresql+psycopg://user:password@host/database?sslmode=require`
- **Supabase**: `postgresql+psycopg://postgres:password@db.xxx.supabase.co:5432/postgres`
- **Local PostgreSQL**: `postgresql+psycopg://user:password@localhost:5432/dbname`

## Deployment Options

### 1. Render Deployment (Recommended for Easy Setup)

Lihat **[RENDER_DEPLOY.md](RENDER_DEPLOY.md)** untuk panduan lengkap.

**Quick Start:**
1. Connect GitHub repository ke Render
2. Set environment variables:
   - `DATABASE_URL`
   - `SESSION_SECRET` (generate dengan `python generate_secret.py`)
   - `CORS_ORIGINS`
3. Build command: `pip install -r requirements.txt && pip install -e . && alembic upgrade head`
4. Start command: `python -m pyramid.scripts.pserve production.ini`
5. Render akan auto-deploy

### 2. Docker Deployment

#### Using Docker Compose (Recommended)
```bash
# Copy env.example to .env and edit
cp env.example .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Using Docker directly
```bash
# Build image
docker build -t backend-app .

# Run container
docker run -d \
  -p 6543:6543 \
  -e DATABASE_URL="your-database-url" \
  -e SESSION_SECRET="your-secret-key" \
  -e PORT=6543 \
  -e CORS_ORIGINS="https://yourdomain.com" \
  --name backend \
  backend-app
```

### 2. Render Deployment

**Lihat [RENDER_DEPLOY.md](RENDER_DEPLOY.md) untuk panduan lengkap dan detail.**

**Quick Steps:**
1. **Create New Web Service** di Render dashboard
2. **Connect your GitHub repository**
3. **Configure service:**
   - **Name**: `backend-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && pip install -e . && alembic upgrade head`
   - **Start Command**: `python -m pyramid.scripts.pserve production.ini`
   - **Health Check Path**: `/health`

4. **Set Environment Variables:**
   - `DATABASE_URL` - PostgreSQL connection string
   - `SESSION_SECRET` - Generate atau biarkan Render generate
   - `CORS_ORIGINS` - Frontend domain(s), comma-separated
   - `PORT` - Render akan set otomatis (tidak perlu set manual)

5. **Create Service** - Render akan build dan deploy otomatis

**Note:** Render menggunakan port `10000` secara default. Kode sudah dikonfigurasi untuk membaca `PORT` dari environment variable.

### 3. Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `SESSION_SECRET` - Generate using `python generate_secret.py`
   - `CORS_ORIGINS` - Your frontend domain(s), comma-separated
   - `PORT` - Will be set automatically by Railway
3. Railway will automatically detect `Procfile` or use `railway.json`
4. Deploy will run automatically on push to main branch

### 4. Heroku Deployment

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set DATABASE_URL="your-database-url"
heroku config:set SESSION_SECRET="your-secret-key"
heroku config:set CORS_ORIGINS="https://yourdomain.com"

# Run migrations
heroku run alembic upgrade head

# Deploy
git push heroku main
```

### 4. VPS/Server Deployment

```bash
# Install dependencies
pip install -r requirements.txt
pip install -e .

# Run migrations
alembic upgrade head

# Run with production config
python -m pyramid.scripts.pserve production.ini
```

### 6. Using Gunicorn (Alternative)

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn --bind 0.0.0.0:6543 --workers 4 "app:main({})"
```

## Database Migrations

Sebelum deploy, jalankan migrations:

```bash
# Upgrade database
alembic upgrade head

# Atau untuk production
DATABASE_URL="your-database-url" alembic upgrade head
```

## Production Checklist

- [ ] Set `DATABASE_URL` environment variable
- [ ] Set `SESSION_SECRET` environment variable (generate with `python generate_secret.py`)
- [ ] Set `CORS_ORIGINS` environment variable with your frontend domain(s)
- [ ] Run database migrations: `alembic upgrade head`
- [ ] Test health endpoint: `GET /health`
- [ ] Test API endpoints (login, register, etc.)
- [ ] Verify CORS headers are present in responses
- [ ] Configure logging (if needed)
- [ ] Set up monitoring/error tracking (Sentry, etc.)
- [ ] Configure SSL/TLS (if using custom domain)
- [ ] Set up backup strategy for database

## CORS Configuration

Untuk production, set environment variable `CORS_ORIGINS`:

```bash
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

Atau untuk development:
```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

Jika `CORS_ORIGINS` tidak diset, akan menggunakan default development origins.

## Health Check

Endpoint health check tersedia di:
- `GET /health`

Response:
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

## Troubleshooting

### Database Connection Issues

- Pastikan `DATABASE_URL` format benar
- Pastikan database accessible dari server
- Check SSL mode jika menggunakan cloud database

### CORS Errors

- Pastikan frontend URL ada di `allowed_origins`
- Check bahwa CORS headers ditambahkan di semua responses

### Port Issues

- Set `PORT` environment variable jika platform menggunakan port berbeda
- Default port adalah 6543
- Platform seperti Railway/Heroku akan set PORT secara otomatis

## Monitoring

Untuk production, pertimbangkan:
- Application monitoring (Sentry, Rollbar)
- Log aggregation (Logtail, Papertrail)
- Uptime monitoring (UptimeRobot, Pingdom)

## Quick Start Commands

```bash
# Generate secret key
python generate_secret.py

# Setup environment
cp env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Development
python -m pyramid.scripts.pserve development.ini --reload

# Production (local)
python -m pyramid.scripts.pserve production.ini

# Docker
docker-compose up -d

# Check health
curl http://localhost:6543/health
```

## File Structure for Deployment

```
backend/
├── app/                    # Application code
├── alembic/                # Database migrations
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose config
├── Procfile               # For Heroku/Railway
├── railway.json           # Railway configuration
├── production.ini         # Production configuration
├── development.ini        # Development configuration
├── requirements.txt       # Python dependencies
├── setup.py               # Package setup
├── env.example            # Environment variables example
├── generate_secret.py     # Secret key generator
├── DEPLOY.md              # This file
└── README.md              # General documentation
```
