# Backend API - Medical Appointment System

Backend API untuk sistem appointment medis menggunakan Pyramid framework.

## Setup Development

1. Install dependencies:
```bash
pip install -r requirements.txt
pip install -e .
```

2. Setup environment variables:
```bash
cp .env.example .env
# Edit .env dengan konfigurasi database Anda
# Database URL format: postgresql+psycopg://user:password@host:port/dbname
```

3. Generate session secret:
```bash
python generate_secret.py
# Copy output ke .env file
```

4. **IMPORTANT: Run database migrations**:
```bash
alembic upgrade head
```
This is required for notifications, messages, and other features to work. If you skip this, notifications and messages will NOT appear.

5. Run development server:
```bash
python -m pyramid.scripts.pserve development.ini --reload
```

Server akan berjalan di `http://127.0.0.1:6543`

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Doctors
- `GET /api/doctors` - List doctors
- `GET /api/doctors/{id}` - Get doctor details
- `GET /api/specializations` - List specializations

### Appointments
- `GET /api/appointments` - List appointments (requires auth)
- `POST /api/appointments` - Create appointment (requires auth)
- `GET /api/appointments/{id}` - Get appointment details
- `GET /api/appointments/today` - Get today's appointments

### Medical Records
- `GET /api/medical-records` - List medical records (requires auth)
- `POST /api/medical-records` - Create medical record (requires auth)

## Deployment

Lihat [DEPLOY.md](DEPLOY.md) untuk panduan deployment lengkap.

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key untuk session (min 32 characters)
- `PORT` - Server port (default: 6543)
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Testing

```bash
# Test health endpoint
python test_server.py

# Test direct login
python test_direct.py
```
