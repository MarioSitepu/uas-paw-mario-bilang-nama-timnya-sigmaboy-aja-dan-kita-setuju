# Clinic Appointment System

Sistem booking appointment klinik dengan manajemen jadwal dokter dan patient records.

## 👥 Tim dan Anggota

| Nama | NIM | Pembagian Tugas |
|------|-----|-----------------|
| Mario Fransiskus Sitepu | 123140023 | Team Leader, Integration, Deployment, Documentation |
| Michael Matthew | 123140101 | Frontend Developer - Components, Routing, State Management |
| Anselmus Herpin Hasugian | 123140020 | Frontend Developer - UI/UX, Forms, Validation |
| Febrian Valetino Nugroho | 123140034 | Backend Developer - API Endpoints, Business Logic |
| Adi Septriansyah | 123140021 | Backend Developer - Authentication, Security, Database |

**Catatan:** Silakan isi nama dan NIM anggota tim sebelum submit.

---

## 📋 Deskripsi Project

Clinic Appointment System adalah aplikasi web full-stack untuk manajemen appointment klinik. Sistem ini memungkinkan pasien untuk booking appointment dengan dokter, melihat jadwal, dan mengakses medical records. Dokter dapat mengelola jadwal praktek, melihat appointment, dan membuat medical records untuk pasien.

### Fitur Utama

#### 1. User Authentication
- ✅ Register dengan role Patient atau Doctor
- ✅ Login dengan password hashing (bcrypt)
- ✅ Logout functionality
- ✅ Session/Token management (JWT)
- ✅ Protected routes dengan role-based access

#### 2. Doctor Management
- ✅ View daftar dokter dengan specialization
- ✅ View jadwal praktek dokter
- ✅ Doctor profile management
- ✅ Schedule settings untuk dokter (set availability per hari)

#### 3. Appointment Booking
- ✅ Patient: Book appointment dengan dokter
- ✅ Patient: View upcoming appointments
- ✅ Patient: Reschedule appointment
- ✅ Patient: Cancel appointment
- ✅ Doctor: View schedule dan appointments
- ✅ Appointment status: pending, confirmed, completed, cancelled

#### 4. Medical Records
- ✅ Doctor: Create patient notes/diagnosis setelah appointment
- ✅ Doctor: View medical records
- ✅ Patient: View medical records
- ✅ Medical records linked ke appointments

#### 5. Dashboard
- ✅ Doctor: View daily appointments dengan analytics
- ✅ Patient: View appointment history
- ✅ Statistics dan insights

#### 6. Fitur Bonus
- ✅ Profile photo upload (Supabase Storage)
- ✅ Google OAuth login
- ✅ Responsive design untuk mobile/tablet/desktop
- ✅ Real-time appointment status updates
- ✅ Advanced filtering dan search

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19.2.0 dengan TypeScript
- **Build Tool:** Vite 7.2.4
- **Routing:** React Router DOM 7.10.1
- **HTTP Client:** Axios 1.13.2
- **Styling:** Tailwind CSS 3.4.19
- **Icons:** Lucide React 0.561.0
- **OAuth:** @react-oauth/google 0.11.1

### Backend
- **Framework:** Python Pyramid 2.0.2
- **WSGI Server:** Waitress 2.1.2
- **ORM:** SQLAlchemy >=2.0.0
- **Migrations:** Alembic 1.12.1
- **Database Driver:** psycopg[binary] >=3.1.0
- **Authentication:** bcrypt >=4.0.0, google-auth >=2.22.0
- **Storage:** Supabase >=2.0.0, Cloudinary >=1.33.0

### Database
- **Database:** PostgreSQL (Supabase)
- **Connection:** Connection Pooler untuk IPv4 compatibility

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Supabase PostgreSQL

---

## 🚀 Cara Instalasi dan Menjalankan

### Prerequisites
- Node.js >= 18.x
- Python >= 3.10
- PostgreSQL (atau gunakan Supabase)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/MarioSitepu/uas-paw-mario-bilang-nama-timnya-sigmaboy-aja-dan-kita-setuju.git
cd uas-paw-mario-bilang-nama-timnya-sigmaboy-aja-dan-kita-setuju
```

### 2. Backend Setup

```bash
cd backend

# Buat virtual environment
python -m venv .venv

# Aktifkan virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
# Copy env.example ke .env dan isi dengan konfigurasi Anda
cp env.example .env

# Edit .env dengan konfigurasi database dan secrets
# DATABASE_URL=postgresql+psycopg://user:password@host:port/database
# SESSION_SECRET=your-secret-key-here
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-supabase-key

# Run database migrations
alembic upgrade head

# (Optional) Seed data untuk testing
python seed_data.py

# Jalankan server development
python -m pyramid.scripts.pserve development.ini --reload
```

Server backend akan berjalan di `http://127.0.0.1:6543`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
# Buat file .env di folder frontend
# VITE_API_URL=http://127.0.0.1:6543
# VITE_GOOGLE_CLIENT_ID=your-google-client-id (optional)

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 4. Akses Aplikasi

- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:6543
- **API Documentation:** http://127.0.0.1:6543/ (home endpoint)

---

## 🌐 Link Deployment

### Frontend
- **URL:** [https://mario-bilang-nama-timnya-sigmaboy-a.vercel.app](https://mario-bilang-nama-timnya-sigmaboy-a.vercel.app/)
- **Platform:** Vercel
- **Status:** ✅ Live dan berfungsi

### Backend
- **URL:** [https://mario-bilang-nama-timnya.onrender.com](https://uas-paw-mario-bilang-nama-timnya.onrender.com)
- **Platform:** Render
- **Status:** ✅ Live dan berfungsi
- **Database:** Supabase PostgreSQL (Connection Pooler)

---

## 📚 API Documentation

Base URL: `https://mario-bilang-nama-timnya-sigmaboy-a.onrender.com`

### Authentication Endpoints

#### POST /api/auth/register
Register user baru (Patient atau Doctor)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient" // atau "doctor"
}
```

**Response (200):**
```json
{
  "message": "Registration successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

#### POST /api/auth/login
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

#### POST /api/auth/logout
Logout user (menghapus token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

#### GET /api/auth/me
Get current user info

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "profile_photo_url": "https://..."
  }
}
```

### Doctors Endpoints

#### GET /api/doctors
Get list of all doctors

**Query Parameters:**
- `specialization` (optional): Filter by specialization

**Response (200):**
```json
{
  "doctors": [
    {
      "id": 1,
      "name": "Dr. Smith",
      "specialization": "Cardiology",
      "schedule": {
        "monday": {
          "available": true,
          "startTime": "09:00",
          "endTime": "17:00"
        }
      },
      "profile_photo_url": "https://..."
    }
  ],
  "total": 1
}
```

#### GET /api/doctors/:id
Get doctor detail by ID

**Response (200):**
```json
{
  "doctor": {
    "id": 1,
    "name": "Dr. Smith",
    "specialization": "Cardiology",
    "schedule": {...},
    "bio": "Experienced cardiologist..."
  }
}
```

#### GET /api/doctors/:id/schedule
Get doctor schedule

**Response (200):**
```json
{
  "schedule": {
    "monday": {
      "available": true,
      "startTime": "09:00",
      "endTime": "17:00",
      "breakStart": "12:00",
      "breakEnd": "13:00"
    }
  }
}
```

#### PUT /api/doctors/:id/schedule
Update doctor schedule (Doctor only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "schedule": {
    "monday": {
      "available": true,
      "startTime": "09:00",
      "endTime": "17:00"
    }
  }
}
```

### Appointments Endpoints

#### GET /api/appointments
Get appointments (filtered by user role)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, confirmed, completed, cancelled)
- `date` (optional): Filter by date (YYYY-MM-DD)

**Response (200):**
```json
{
  "appointments": [
    {
      "id": 1,
      "patient_id": 2,
      "doctor_id": 1,
      "appointment_date": "2025-12-20",
      "appointment_time": "10:00:00",
      "status": "confirmed",
      "reason": "Regular checkup",
      "doctor": {
        "id": 1,
        "name": "Dr. Smith",
        "specialization": "Cardiology"
      },
      "patient": {
        "id": 2,
        "name": "John Doe"
      }
    }
  ],
  "total": 1
}
```

#### POST /api/appointments
Create new appointment (Patient only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "doctor_id": 1,
  "appointment_date": "2025-12-20",
  "appointment_time": "10:00",
  "reason": "Regular checkup"
}
```

**Response (201):**
```json
{
  "message": "Appointment created successfully",
  "appointment": {
    "id": 1,
    "patient_id": 2,
    "doctor_id": 1,
    "appointment_date": "2025-12-20",
    "appointment_time": "10:00:00",
    "status": "pending"
  }
}
```

#### PUT /api/appointments/:id
Update appointment (reschedule atau update status)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "appointment_date": "2025-12-21",
  "appointment_time": "14:00",
  "status": "confirmed"
}
```

#### DELETE /api/appointments/:id
Cancel appointment

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Appointment cancelled successfully"
}
```

### Medical Records Endpoints

#### GET /api/medical-records
Get medical records (filtered by user role)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "medical_records": [
    {
      "id": 1,
      "appointment_id": 1,
      "diagnosis": "Hypertension",
      "symptoms": "High blood pressure",
      "treatment": "Medication and lifestyle changes",
      "prescription": "Lisinopril 10mg daily",
      "notes": "Follow up in 1 month",
      "created_at": "2025-12-19T10:00:00Z"
    }
  ]
}
```

#### POST /api/medical-records
Create medical record (Doctor only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "appointment_id": 1,
  "diagnosis": "Hypertension",
  "symptoms": "High blood pressure",
  "treatment": "Medication and lifestyle changes",
  "prescription": "Lisinopril 10mg daily",
  "notes": "Follow up in 1 month"
}
```

#### PUT /api/medical-records/:id
Update medical record (Doctor only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "diagnosis": "Updated diagnosis",
  "notes": "Updated notes"
}
```

### Dashboard Endpoints

#### GET /api/dashboard
Get dashboard data (statistics, appointments, etc.)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "stats": {
    "total_appointments": 10,
    "pending_appointments": 3,
    "confirmed_appointments": 5,
    "completed_appointments": 2
  },
  "recent_appointments": [...],
  "upcoming_appointments": [...]
}
```

### Error Responses

Semua endpoint mengembalikan error dalam format:

```json
{
  "error": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📸 Screenshot Aplikasi

### Landing Page
![Landing Page](https://via.placeholder.com/800x400?text=Landing+Page)

### Login Page
![Login Page](https://via.placeholder.com/800x400?text=Login+Page)

### Patient Dashboard
![Patient Dashboard](https://via.placeholder.com/800x400?text=Patient+Dashboard)

### Doctor Dashboard
![Doctor Dashboard](https://via.placeholder.com/800x400?text=Doctor+Dashboard)

### Appointment Booking
![Appointment Booking](https://via.placeholder.com/800x400?text=Appointment+Booking)

### Medical Records
![Medical Records](https://via.placeholder.com/800x400?text=Medical+Records)

**Catatan:** Silakan ganti placeholder images dengan screenshot aplikasi yang sebenarnya sebelum submit.

---

## 🎥 Video Presentasi

**Link Video:** https://www.youtube.com/watch?v=dQw4w9WgXcQ

**Durasi:** ~10 menit

**Isi Video:**
- Intro tim dan pembagian tugas
- Demo semua fitur aplikasi
- Penjelasan technical implementation
- Deployment process

**Catatan:** Silakan ganti dengan link video presentasi yang sebenarnya sebelum submit.

---

## 📁 Struktur Project

```
uas-paw-mario-bilang-nama-timnya-sigmaboy-aja-dan-kita-setuju/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── cards/         # Card components
│   │   │   ├── layout/        # Layout components
│   │   │   ├── routes/        # Route guards
│   │   │   ├── sections/       # Landing page sections
│   │   │   └── ui/            # UI components
│   │   ├── context/           # React Context (AuthContext)
│   │   ├── pages/             # Page components
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── doctor/        # Doctor pages
│   │   │   └── patient/       # Patient pages
│   │   ├── services/          # API services
│   │   │   ├── api.ts         # Axios instance
│   │   │   └── mock/          # Mock services (development)
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── App.tsx            # Main App component
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── models/            # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── doctor.py
│   │   │   ├── appointment.py
│   │   │   ├── medical_record.py
│   │   │   └── token.py
│   │   ├── views/             # API endpoints
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   ├── doctors.py     # Doctor endpoints
│   │   │   ├── appointments.py # Appointment endpoints
│   │   │   ├── medical_records.py # Medical records endpoints
│   │   │   ├── profile.py     # Profile endpoints
│   │   │   └── upload.py      # File upload endpoints
│   │   ├── routes.py           # Route configuration
│   │   └── __init__.py        # Pyramid app factory
│   ├── alembic/               # Database migrations
│   │   ├── versions/
│   │   │   ├── 001_initial.py
│   │   │   ├── 002_add_tokens_table.py
│   │   │   └── 003_add_profile_photo.py
│   │   └── env.py
│   ├── requirements.txt
│   ├── development.ini        # Development config
│   ├── production.ini         # Production config
│   ├── start_server.py        # Production server starter
│   └── seed_data.py           # Seed data script
│
└── README.md                   # This file
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql+psycopg://user:password@host:port/database?sslmode=require

# Session
SESSION_SECRET=your-secret-key-minimum-32-characters

# CORS
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173

# Supabase (untuk profile photo storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Port (untuk production, Render akan set otomatis)
PORT=10000
```

### Frontend (.env)

```env
# API Base URL
VITE_API_URL=https://your-backend.onrender.com

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'patient',
    profile_photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

### Doctors Table
```sql
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    bio TEXT,
    schedule JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

### Medical_Records Table
```sql
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    symptoms TEXT,
    treatment TEXT,
    prescription TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

### Tokens Table
```sql
CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(512) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Testing

### Manual Testing Checklist

- [x] User registration (Patient dan Doctor)
- [x] User login dan logout
- [x] Patient dapat book appointment
- [x] Patient dapat view appointments
- [x] Patient dapat reschedule appointment
- [x] Patient dapat cancel appointment
- [x] Doctor dapat view schedule
- [x] Doctor dapat update schedule
- [x] Doctor dapat create medical records
- [x] Doctor dapat view medical records
- [x] Protected routes bekerja dengan benar
- [x] Role-based access control bekerja
- [x] Forms validation bekerja
- [x] Error handling bekerja
- [x] Responsive design di mobile/tablet/desktop

---

## 📝 Git Commits

Repository ini memiliki lebih dari 30 commits dari berbagai anggota tim, dengan commit messages yang jelas dan terorganisir.

**Contoh commit messages:**
- `feat: add user authentication with JWT`
- `feat: implement appointment booking system`
- `fix: resolve CORS issues for frontend-backend communication`
- `fix: correct database connection for Render deployment`
- `refactor: improve component structure and reusability`
- `docs: add API documentation and deployment guides`

---

## 🐛 Known Issues & Limitations

1. **Backend Deployment:** Saat ini menggunakan Render, belum menggunakan domain *.web.id sesuai requirement (akan diupdate)
2. **Video Presentation:** Link video masih placeholder (akan diupdate sebelum submit)
3. **Screenshots:** Screenshot masih menggunakan placeholder (akan diupdate sebelum submit)

---

## 📄 License

Project ini dibuat untuk keperluan UAS Pemrograman Web.

---

## 🙏 Acknowledgments

- React Documentation: https://react.dev/
- Pyramid Documentation: https://docs.pylonsproject.org/
- SQLAlchemy Documentation: https://docs.sqlalchemy.org/
- Tailwind CSS Documentation: https://tailwindcss.com/
- Supabase Documentation: https://supabase.com/docs

---

## 📞 Contact

Untuk pertanyaan atau issues, silakan buat issue di GitHub repository ini.

---

**Last Updated:** 19 Desember 2025
