# 📹 Naskah Video Presentasi - Clinic Appointment System

## 📋 Informasi Umum

**Judul Project:** Clinic Appointment System  
**Tim:** SigmaBoy  
**Durasi Total Video:** Maksimal 10 menit  
**Format:** Video presentasi + demo aplikasi

---

## 👥 Pembagian Tugas Presentasi

| Bagian | Penanggung Jawab | Nama | NIM | Durasi Estimasi |
|--------|------------------|------|-----|-----------------|
| **Bagian 1: Opening & Overview** | PM | Mario Fransiskus Sitepu | 123140023 | ~2 menit |
| **Bagian 2: Demo Aplikasi - Frontend** | FE 1 | Michael Matthew | 123140101 | ~3 menit |
| **Bagian 3: Demo Aplikasi - Backend & Fitur** | FE 2 | Anselmus Herpin Hasugian | 123140020 | ~2 menit |
| **Bagian 4: Penjelasan Teknis & Pembagian Tugas** | BE 1 & BE 2 | Febrian Valetino Nugroho & Adi Septriansyah | 123140034 & 123140021 | ~5-6 menit |
| **Bagian 5: Closing & Deployment** | PM | Mario Fransiskus Sitepu | 123140023 | ~1 menit |

**Total Durasi:** ~13-14 menit (dapat dipotong sesuai kebutuhan untuk tetap dalam batas 10 menit)

---

## 🎬 BAGIAN 1: Opening & Overview (PM - Mario)

### Naskah:

**[Scene: PM berdiri di depan kamera dengan slide intro]**

"Assalamualaikum warahmatullahi wabarakatuh. Selamat pagi/siang/sore, Bapak/Ibu dosen dan teman-teman sekalian.

Perkenalkan, saya **Mario Fransiskus Sitepu** dengan NIM **123140023**, sebagai Project Manager dari tim **SigmaBoy**. Pada kesempatan ini, kami akan mempresentasikan project UAS Pemrograman Web dengan judul **Clinic Appointment System**.

**[Tampilkan slide dengan logo/nama aplikasi]**

Clinic Appointment System adalah aplikasi web full-stack yang dirancang untuk memudahkan manajemen appointment di klinik. Aplikasi ini menghubungkan pasien dengan dokter secara efisien, memungkinkan booking appointment online, manajemen jadwal dokter, dan pencatatan medical records secara digital.

**[Tampilkan slide overview fitur utama]**

Aplikasi kami memiliki beberapa fitur utama:
1. **User Authentication** - Sistem login dan registrasi dengan role-based access
2. **Doctor Management** - Manajemen profil dokter dan jadwal praktek
3. **Appointment Booking** - Sistem booking, reschedule, dan cancel appointment
4. **Medical Records** - Pencatatan rekam medis pasien oleh dokter
5. **Dashboard** - Dashboard terpisah untuk dokter dan pasien dengan analytics

**[Tampilkan slide tech stack]**

Untuk teknologi yang digunakan, kami menggunakan:
- **Frontend:** React 19 dengan TypeScript, Tailwind CSS, dan Vite
- **Backend:** Python Pyramid dengan SQLAlchemy ORM
- **Database:** PostgreSQL di Supabase
- **Deployment:** Frontend di Vercel, Backend di Render

Sekarang, saya akan menyerahkan kepada tim Frontend untuk melakukan demo aplikasi. Silakan, Michael."

**[Transition ke demo aplikasi]**

---

## 🎬 BAGIAN 2: Demo Aplikasi - Frontend (FE 1 - Michael)

### Naskah:

**[Scene: Screen recording aplikasi yang sedang berjalan]**

"Terima kasih, Mario. Perkenalkan, saya **Michael Matthew** dengan NIM **123140101**, Frontend Developer dari tim SigmaBoy.

Saya akan mendemonstrasikan bagian frontend dari aplikasi Clinic Appointment System. Mari kita mulai dari halaman landing page."

**[Buka aplikasi di browser - Landing Page]**

"Pertama, kita lihat landing page aplikasi. Halaman ini menampilkan informasi tentang klinik, layanan yang tersedia, dan call-to-action untuk booking appointment. Design-nya responsive dan modern menggunakan Tailwind CSS."

**[Klik tombol "Book Appointment" atau navigasi ke login]**

"Sekarang, mari kita coba fitur authentication. Saya akan login sebagai pasien terlebih dahulu."

**[Tampilkan halaman login]**

"Di halaman login, pengguna dapat login dengan email dan password, atau menggunakan Google OAuth untuk kemudahan akses. Sistem menggunakan JWT token untuk session management."

**[Login sebagai patient]**

"Setelah login, kita akan diarahkan ke Patient Dashboard."

**[Tampilkan Patient Dashboard]**

"Di dashboard pasien, kita dapat melihat:
- Statistik appointment (total, pending, confirmed, completed)
- Appointment yang akan datang
- Riwayat appointment
- Quick access untuk booking appointment baru"

**[Klik "Book Appointment" atau navigasi ke Doctors List]**

"Sekarang, mari kita coba fitur booking appointment. Pasien dapat melihat daftar dokter yang tersedia beserta spesialisasinya."

**[Tampilkan halaman Doctors List]**

"Di sini, pasien dapat melihat profil dokter, jadwal praktek, dan memilih dokter yang diinginkan."

**[Klik salah satu dokter untuk booking]**

"Setelah memilih dokter, kita dapat memilih tanggal dan waktu yang tersedia. Sistem akan menampilkan time slot yang available berdasarkan jadwal dokter."

**[Tampilkan form booking dengan date picker dan time slot]**

"Pasien mengisi form booking dengan:
- Tanggal appointment
- Waktu appointment (dari slot yang tersedia)
- Alasan kunjungan"

**[Submit booking]**

"Setelah booking berhasil, appointment akan muncul dengan status 'pending' dan menunggu konfirmasi dari dokter."

**[Tampilkan halaman Appointments List]**

"Di halaman appointments, pasien dapat melihat semua appointment mereka, dengan filter berdasarkan status. Pasien juga dapat melakukan reschedule atau cancel appointment."

**[Tampilkan detail appointment]**

"Di detail appointment, pasien dapat melihat informasi lengkap, termasuk medical record jika appointment sudah selesai."

Sekarang, saya akan menyerahkan kepada Anselmus untuk melanjutkan demo bagian lainnya."

---

## 🎬 BAGIAN 3: Demo Aplikasi - Backend & Fitur Lanjutan (FE 2 - Anselmus)

### Naskah:

**[Scene: Screen recording aplikasi - switch ke Doctor view]**

"Terima kasih, Michael. Perkenalkan, saya **Anselmus Herpin Hasugian** dengan NIM **123140020**, Frontend Developer dari tim SigmaBoy.

Sekarang saya akan mendemonstrasikan fitur dari sisi dokter dan beberapa fitur lanjutan lainnya."

**[Logout dan login sebagai doctor]**

"Pertama, saya akan login sebagai dokter untuk menunjukkan fitur yang tersedia untuk role dokter."

**[Tampilkan Doctor Dashboard]**

"Di Doctor Dashboard, dokter dapat melihat:
- Statistik appointment hari ini
- Appointment yang pending untuk dikonfirmasi
- Appointment yang sudah dijadwalkan
- Analytics dan insights"

**[Klik salah satu appointment pending]**

"Sekarang, mari kita lihat detail appointment. Dokter dapat mengonfirmasi appointment yang pending."

**[Tampilkan Appointment Detail - Doctor view]**

"Di halaman detail appointment, dokter dapat:
- Melihat informasi pasien
- Mengonfirmasi appointment
- Melihat atau membuat medical record setelah appointment selesai"

**[Klik "Confirm Appointment"]**

"Setelah appointment dikonfirmasi, status berubah menjadi 'confirmed'."

**[Tampilkan fitur Schedule Settings]**

"Sekarang, mari kita lihat fitur Schedule Settings. Dokter dapat mengatur jadwal praktek mereka per hari, termasuk waktu mulai, waktu selesai, dan waktu istirahat."

**[Tampilkan form schedule settings]**

"Dokter dapat mengatur availability untuk setiap hari dalam seminggu, memungkinkan fleksibilitas dalam manajemen jadwal."

**[Tampilkan Medical Records page]**

"Setelah appointment selesai, dokter dapat membuat medical record untuk pasien. Medical record mencakup:
- Diagnosis
- Gejala (symptoms)
- Perawatan (treatment)
- Resep (prescription)
- Catatan tambahan (notes)"

**[Tampilkan form create medical record]**

"Medical record ini akan terhubung dengan appointment dan dapat diakses oleh pasien di dashboard mereka."

**[Tampilkan Profile page]**

"Sekarang, mari kita lihat fitur Profile. Pengguna dapat mengupdate profil mereka, termasuk upload foto profil yang disimpan di Supabase Storage."

**[Tampilkan form upload profile photo]**

"Fitur upload foto menggunakan Supabase Storage untuk penyimpanan yang aman dan scalable."

**[Tampilkan responsive design di mobile view]**

"Terakhir, aplikasi ini fully responsive. Mari kita lihat tampilan di mobile device. Semua fitur tetap dapat diakses dengan baik di berbagai ukuran layar."

Sekarang, saya akan menyerahkan kepada tim Backend untuk menjelaskan aspek teknis dan pembagian tugas."

---

## 🎬 BAGIAN 4: Penjelasan Teknis & Pembagian Tugas (BE 1 & BE 2)

### Naskah:

**[Scene: BE 1 dan BE 2 berdiri bersama atau bergantian]**

**BE 1 (Febrian):** "Terima kasih, Anselmus. Perkenalkan, saya **Febrian Valetino Nugroho** dengan NIM **123140034**, Backend Developer dari tim SigmaBoy.

Saya akan menjelaskan aspek teknis backend dari aplikasi ini secara detail."

**[Tampilkan slide atau code editor dengan backend structure]**

"Backend aplikasi ini dibangun menggunakan **Python Pyramid framework** versi 2.0.2. Pyramid adalah framework web yang powerful dan fleksibel untuk membangun aplikasi Python. Kami memilih Pyramid karena kemudahan dalam konfigurasi routing, dependency injection, dan extensibility-nya.

Untuk interaksi dengan database, kami menggunakan **SQLAlchemy** versi 2.0 sebagai ORM. SQLAlchemy memungkinkan kami untuk bekerja dengan database PostgreSQL secara object-oriented, yang membuat kode lebih maintainable dan mudah di-debug."

**[Tampilkan struktur folder backend di code editor]**

"Mari kita lihat struktur backend aplikasi. Kami mengorganisir kode dengan struktur yang jelas:

- **app/models/** - Berisi SQLAlchemy models untuk semua tabel database
- **app/views/** - Berisi semua API endpoint handlers, terbagi per modul:
  - auth.py untuk authentication
  - doctors.py untuk manajemen dokter
  - appointments.py untuk appointment logic
  - medical_records.py untuk rekam medis
  - profile.py untuk profil user
  - upload.py untuk file upload
- **app/routes.py** - Konfigurasi semua route aplikasi
- **alembic/** - Database migrations menggunakan Alembic"

**[Tampilkan routes.py dengan semua endpoints]**

"Kami memiliki total lebih dari 20 API endpoints yang terorganisir dengan baik. Mari saya jelaskan beberapa endpoint utama:

**Authentication Endpoints:**
- POST /api/auth/register - Register user baru dengan role patient atau doctor
- POST /api/auth/login - Login dengan email dan password
- POST /api/auth/google - Google OAuth authentication
- POST /api/auth/logout - Logout dan invalidate token
- GET /api/auth/me - Get current user information

**Doctors Endpoints:**
- GET /api/doctors - List semua dokter dengan filter specialization
- GET /api/doctors/{id} - Get detail dokter spesifik
- GET /api/doctors/{id}/schedule - Get jadwal dokter
- PUT /api/doctors/{id}/schedule - Update jadwal dokter (doctor only)
- GET /api/doctors/{id}/slots - Get available time slots untuk booking

**Appointments Endpoints:**
- GET /api/appointments - List appointments (filtered by role)
- POST /api/appointments - Create appointment baru (patient only)
- GET /api/appointments/{id} - Get detail appointment
- PUT /api/appointments/{id} - Update appointment (reschedule atau update status)
- DELETE /api/appointments/{id} - Cancel appointment
- GET /api/appointments/today - Get today's appointments (doctor only)

**Medical Records Endpoints:**
- GET /api/medical-records - List medical records
- POST /api/medical-records - Create medical record (doctor only)
- PUT /api/medical-records/{id} - Update medical record (doctor only)"

**[Tampilkan contoh code authentication - auth.py]**

"Sekarang, mari kita lihat implementasi authentication system. Ini adalah bagian kritis dari aplikasi."

**[Tampilkan code password hashing]**

"Untuk keamanan password, kami menggunakan **PBKDF2 dengan SHA-256** dan salt yang unik untuk setiap user. Setiap password di-hash dengan 100,000 iterations, yang membuat brute force attack menjadi sangat sulit. Salt di-generate menggunakan secrets.token_hex untuk memastikan keamanan maksimal."

**[Tampilkan code token generation]**

"Untuk session management, kami menggunakan **JWT-like token system** yang disimpan di database. Setiap token memiliki:
- Token string yang unik (512 karakter)
- User ID yang terkait
- Expiration time (default 7 hari)
- Created timestamp

Token disimpan di tabel `tokens` untuk memungkinkan logout dan token invalidation yang proper."

**[Tampilkan code require_auth decorator]**

"Kami membuat decorator `require_auth` yang digunakan untuk melindungi endpoint yang memerlukan authentication. Decorator ini:
1. Mengextract token dari Authorization header
2. Memvalidasi token di database
3. Mengecek expiration time
4. Mengembalikan user object jika valid
5. Mengembalikan error 401 jika tidak valid"

**[Tampilkan code role-based access control]**

"Untuk role-based access control, kami membuat fungsi `require_role` yang memastikan hanya user dengan role tertentu yang dapat mengakses endpoint tertentu. Contohnya:
- Endpoint create appointment hanya bisa diakses oleh patient
- Endpoint create medical record hanya bisa diakses oleh doctor
- Endpoint update schedule hanya bisa diakses oleh doctor yang bersangkutan"

**[Tampilkan database schema diagram]**

"Sekarang, mari kita bahas database schema. Kami memiliki 5 tabel utama dengan relationships yang jelas:

**1. Users Table:**
- Menyimpan data dasar semua user (patient dan doctor)
- Fields: id, name, email, password_hash, salt, role, profile_photo_url
- Role bisa berupa 'patient', 'doctor', atau 'admin'
- One-to-one relationship dengan Doctors table

**2. Doctors Table:**
- Menyimpan data spesifik dokter
- Fields: id, user_id (FK ke Users), specialization, license_number, phone, bio, schedule (JSONB)
- Schedule disimpan sebagai JSONB untuk fleksibilitas jadwal per hari
- One-to-many relationship dengan Appointments

**3. Appointments Table:**
- Menyimpan data appointment
- Fields: id, patient_id (FK ke Users), doctor_id (FK ke Doctors), appointment_date, appointment_time, status, reason, notes
- Status: 'pending', 'confirmed', 'completed', 'cancelled'
- One-to-one relationship dengan Medical Records

**4. Medical Records Table:**
- Menyimpan rekam medis pasien
- Fields: id, appointment_id (FK ke Appointments, unique), diagnosis, symptoms, treatment, prescription, notes
- Linked ke appointment untuk tracking history

**5. Tokens Table:**
- Menyimpan JWT tokens untuk session management
- Fields: id, token, user_id (FK ke Users), expires_at, created_at
- Memungkinkan token invalidation saat logout"

**[Tampilkan code appointment creation logic]**

"Sekarang, mari kita lihat business logic untuk appointment creation. Ini adalah salah satu fitur kompleks di aplikasi."

**[Tampilkan code validasi appointment]**

"Ketika pasien membuat appointment, sistem melakukan beberapa validasi:
1. **Role Check** - Memastikan hanya patient yang bisa create appointment
2. **Doctor Existence** - Memverifikasi dokter yang dipilih ada di database
3. **Date Validation** - Memastikan tanggal appointment tidak di masa lalu
4. **Time Slot Validation** - Mengecek apakah time slot tersedia berdasarkan jadwal dokter
5. **Conflict Check** - Memastikan tidak ada appointment lain di waktu yang sama untuk dokter tersebut

Setelah semua validasi passed, appointment dibuat dengan status 'pending' dan menunggu konfirmasi dari dokter."

**[Tampilkan code schedule management]**

"Untuk jadwal dokter, kami menyimpan schedule sebagai JSONB di PostgreSQL. Formatnya seperti ini:
```json
{
  "monday": {
    "available": true,
    "startTime": "09:00",
    "endTime": "17:00",
    "breakStart": "12:00",
    "breakEnd": "13:00"
  },
  "tuesday": { ... }
}
```

Ini memungkinkan fleksibilitas untuk setiap dokter memiliki jadwal yang berbeda per hari."

**[Tampilkan code time slot calculation]**

"Untuk menghitung available time slots, sistem:
1. Membaca schedule dokter untuk hari yang dipilih
2. Mengecek appointment yang sudah ada di hari tersebut
3. Menghitung slot yang tersedia (biasanya 30 menit per slot)
4. Menghindari waktu istirahat
5. Mengembalikan list time slots yang available"

**BE 2 (Adi):** "Terima kasih, Febrian. Perkenalkan, saya **Adi Septriansyah** dengan NIM **123140021**, Backend Developer dari tim SigmaBoy.

Saya akan melanjutkan dengan penjelasan tentang security, database migrations, dan file upload implementation."

**[Tampilkan code CORS configuration]**

"Untuk keamanan, kami mengimplementasikan beberapa layer protection:

**1. CORS (Cross-Origin Resource Sharing):**
Kami mengkonfigurasi CORS dengan whitelist origins yang diizinkan. Ini mencegah unauthorized domain untuk mengakses API kami. CORS di-handle melalui Pyramid tween factory yang memeriksa setiap request."

**[Tampilkan code input validation]**

"**2. Input Validation:**
Setiap endpoint melakukan validasi input yang ketat:
- Required fields check
- Data type validation
- Range validation (untuk tanggal, waktu)
- SQL injection prevention melalui SQLAlchemy parameterized queries
- XSS prevention dengan proper data sanitization"

**[Tampilkan code error handling]**

"**3. Error Handling:**
Kami mengimplementasikan comprehensive error handling:
- Try-catch blocks di setiap endpoint
- Proper HTTP status codes (400, 401, 403, 404, 500)
- Error messages yang informatif tapi tidak expose sensitive information
- Database session cleanup di finally block untuk prevent connection leaks"

**[Tampilkan Alembic migrations]**

"Sekarang, mari kita bahas database migrations. Kami menggunakan **Alembic** untuk version control database schema."

**[Tampilkan migration files]**

"Kami memiliki 3 migration files:
1. **001_initial.py** - Initial schema dengan semua tabel dasar
2. **002_add_tokens_table.py** - Menambahkan tabel tokens untuk JWT management
3. **003_add_profile_photo.py** - Menambahkan kolom profile_photo_url ke tabel users

Migrations memungkinkan kami untuk:
- Track perubahan schema
- Rollback jika ada masalah
- Apply changes ke production dengan aman
- Maintain consistency antara development dan production database"

**[Tampilkan code file upload - Supabase]**

"Sekarang, mari kita bahas implementasi file upload untuk profile photo. Ini adalah fitur yang cukup kompleks."

**[Tampilkan code Supabase integration]**

"Kami menggunakan **Supabase Storage** untuk menyimpan foto profil. Alur kerjanya:
1. Frontend mengirim file sebagai base64 atau FormData
2. Backend menerima file dan memvalidasi:
   - File type (hanya image: jpg, jpeg, png)
   - File size (max 5MB)
   - Image dimensions
3. Backend upload file ke Supabase Storage bucket
4. Supabase mengembalikan public URL
5. URL disimpan di database (users.profile_photo_url)
6. URL dikembalikan ke frontend untuk ditampilkan"

**[Tampilkan code Google OAuth]**

"Untuk Google OAuth, kami mengintegrasikan dengan Google Identity Services. Flow-nya:
1. Frontend mendapatkan ID token dari Google
2. Frontend mengirim ID token ke backend endpoint /api/auth/google
3. Backend memverifikasi ID token menggunakan google-auth library
4. Jika valid, backend:
   - Mengecek apakah user sudah ada (berdasarkan email)
   - Jika belum ada, membuat user baru
   - Generate JWT token
   - Return token dan user data ke frontend"

**[Tampilkan code database connection pooling]**

"Sekarang, mari kita bahas database connection management. Ini penting untuk performance dan reliability."

**[Tampilkan code connection pooler]**

"Kami menggunakan **Supabase Connection Pooler** untuk mengatasi masalah koneksi database. Connection pooler:
- Mengelola pool koneksi yang reusable
- Mengurangi overhead koneksi baru
- Meningkatkan performance untuk concurrent requests
- Compatible dengan IPv4 (penting untuk deployment di Render)

Kami juga mengimplementasikan retry logic untuk handle connection timeout atau temporary failures."

**[Tampilkan code query optimization]**

"Untuk query optimization, kami menggunakan beberapa teknik:
1. **Eager Loading** - Menggunakan SQLAlchemy joinedload untuk prevent N+1 queries
2. **Indexing** - Menambahkan index pada foreign keys dan frequently queried columns
3. **Selective Loading** - Hanya load data yang diperlukan (tidak load semua relationships)
4. **Pagination** - Untuk list endpoints yang bisa return banyak data"

**[Tampilkan slide pembagian tugas detail]**

"Sekarang, mari kita bahas pembagian tugas dalam pengembangan aplikasi ini secara detail:"

**[Tampilkan slide dengan detail tugas]**

"**Project Manager (Mario):**
- Team Leader dan koordinator seluruh tim
- Integration testing antara frontend dan backend
- Deployment configuration untuk Vercel dan Render
- Environment variables management
- Dokumentasi lengkap project (README, API docs)
- Troubleshooting deployment issues
- Code review dan quality assurance

**Frontend Developer 1 (Michael):**
- Components development dengan React dan TypeScript
- Routing configuration dengan React Router
- State management menggunakan React Context API
- API integration dengan Axios
- Error handling di frontend
- Loading states dan user feedback

**Frontend Developer 2 (Anselmus):**
- UI/UX design dengan Tailwind CSS
- Form development dengan validation
- Responsive design untuk mobile, tablet, desktop
- User experience optimization
- Component styling dan theming
- Accessibility improvements

**Backend Developer 1 (Febrian - saya):**
- API endpoints development untuk semua modul
- Business logic implementation:
  - Appointment booking logic dengan validasi kompleks
  - Schedule management dan time slot calculation
  - Medical records CRUD operations
  - Doctor profile management
- Database queries optimization
- Data transformation dan serialization
- API response formatting

**Backend Developer 2 (Adi):**
- Authentication system implementation:
  - Password hashing dengan PBKDF2
  - JWT token generation dan validation
  - Google OAuth integration
  - Session management
- Security implementation:
  - CORS configuration
  - Input validation
  - SQL injection prevention
  - Error handling
- Database schema design
- Alembic migrations development
- File upload handling dengan Supabase Storage
- Database connection management"

**[Tampilkan slide challenges dan solutions detail]**

"Sekarang, mari kita bahas challenges yang kami hadapi dan bagaimana kami menyelesaikannya:"

**[Tampilkan slide challenge 1]**

"**Challenge 1: CORS Issues**
Masalah: Frontend di Vercel tidak bisa mengakses backend di Render karena CORS policy.
Solusi: 
- Mengkonfigurasi CORS di Pyramid dengan whitelist origins
- Menambahkan proper headers (Access-Control-Allow-Origin, Access-Control-Allow-Methods)
- Handle preflight OPTIONS requests
- Testing dengan berbagai browser dan tools"

**[Tampilkan slide challenge 2]**

"**Challenge 2: Database Connection Issues**
Masalah: Render menggunakan IPv6, tapi Supabase connection pooler memerlukan IPv4.
Solusi:
- Menggunakan Supabase Connection Pooler dengan port khusus (6543)
- Mengkonfigurasi connection string dengan parameter sslmode=require
- Implement retry logic untuk handle connection timeout
- Monitoring connection health dengan health check endpoint"

**[Tampilkan slide challenge 3]**

"**Challenge 3: File Upload Implementation**
Masalah: Upload file ke Supabase Storage memerlukan authentication dan proper configuration.
Solusi:
- Setup Supabase Storage bucket dengan public access
- Implement file validation (type, size, dimensions)
- Handle base64 encoding/decoding
- Error handling untuk upload failures
- Fallback mechanism jika upload gagal"

**[Tampilkan slide challenge 4]**

"**Challenge 4: Appointment Time Slot Calculation**
Masalah: Menghitung available time slots dengan mempertimbangkan schedule, existing appointments, dan breaks.
Solusi:
- Parse JSONB schedule dengan proper error handling
- Query existing appointments untuk hari yang dipilih
- Algorithm untuk generate time slots (30 menit intervals)
- Filter out booked slots dan break times
- Handle edge cases (end of day, no schedule, etc.)"

**[Tampilkan slide challenge 5]**

"**Challenge 5: Role-Based Access Control**
Masalah: Memastikan hanya user dengan role tertentu yang bisa mengakses endpoint tertentu.
Solusi:
- Implement decorator pattern untuk require_role
- Check role di setiap protected endpoint
- Proper error messages (403 Forbidden)
- Testing dengan berbagai role combinations"

**[Tampilkan slide testing dan quality assurance]**

"Untuk memastikan kualitas kode, kami melakukan:
- Manual testing untuk semua endpoints
- Testing dengan berbagai user roles
- Testing edge cases dan error scenarios
- Integration testing antara frontend dan backend
- Performance testing untuk query optimization
- Security testing untuk vulnerability checks"

**[Tampilkan slide deployment process]**

"Untuk deployment process:
1. **Frontend (Vercel):**
   - Automatic deployment dari GitHub main branch
   - Environment variables configuration
   - Build optimization dengan Vite
   - CDN distribution untuk performance

2. **Backend (Render):**
   - Manual deployment dengan Git integration
   - Environment variables dari Render dashboard
   - Health check endpoint untuk monitoring
   - Automatic restart on failure
   - Log monitoring untuk debugging

3. **Database (Supabase):**
   - PostgreSQL database dengan connection pooler
   - Automatic backups
   - Migration management dengan Alembic
   - Performance monitoring"

**[Tampilkan slide API documentation]**

"Kami juga membuat dokumentasi API yang lengkap di README.md, mencakup:
- Semua endpoints dengan method dan path
- Request body format
- Response format
- Error responses
- Authentication requirements
- Example requests dan responses"

Sekarang, saya akan menyerahkan kembali kepada Mario untuk closing dan informasi deployment."

---

## 🎬 BAGIAN 5: Closing & Deployment (PM - Mario)

### Naskah:

**[Scene: PM kembali di depan kamera]**

"Terima kasih, Febrian dan Adi. Saya **Mario Fransiskus Sitepu**, kembali sebagai Project Manager.

Sebagai penutup, saya akan memberikan informasi tentang deployment dan akses aplikasi."

**[Tampilkan slide dengan link deployment]**

"Aplikasi Clinic Appointment System telah di-deploy dan dapat diakses di:

**Frontend:**
- URL: https://mario-bilang-nama-timnya-sigmaboy-a.vercel.app
- Platform: Vercel
- Status: ✅ Live dan berfungsi

**Backend API:**
- URL: https://mario-bilang-nama-timnya-sigmaboy-a.onrender.com
- Platform: Render
- Status: ✅ Live dan berfungsi
- Database: Supabase PostgreSQL

**[Tampilkan slide repository]**

"Source code aplikasi dapat diakses di GitHub repository:
https://github.com/MarioSitepu/uas-paw-mario-bilang-nama-timnya-sigmaboy-aja-dan-kita-setuju

Repository ini memiliki lebih dari 30 commits dengan commit messages yang jelas dan terorganisir."

**[Tampilkan slide fitur bonus]**

"Sebagai tambahan, aplikasi ini juga memiliki beberapa fitur bonus:
- ✅ Google OAuth login
- ✅ Profile photo upload dengan Supabase Storage
- ✅ Responsive design untuk semua device
- ✅ Real-time appointment status updates
- ✅ Advanced filtering dan search functionality"

**[Tampilkan slide penutup]**

"Demikian presentasi dari tim SigmaBoy mengenai Clinic Appointment System. Aplikasi ini telah melalui proses development yang matang dengan pembagian tugas yang jelas, testing yang komprehensif, dan deployment yang sukses.

Kami berharap aplikasi ini dapat memberikan manfaat dalam manajemen appointment klinik secara digital.

Terima kasih atas perhatiannya. Wassalamualaikum warahmatullahi wabarakatuh."

**[End screen dengan informasi tim dan link]**

---

## 📝 Catatan Penting untuk Recording

### Persiapan Sebelum Recording:

1. **Persiapan Teknis:**
   - Pastikan aplikasi sudah running di production (Vercel & Render)
   - Siapkan akun test untuk patient dan doctor
   - Test semua fitur yang akan didemonstrasikan
   - Siapkan screen recording software (OBS, Loom, atau Zoom)
   - Pastikan kualitas audio dan video baik

2. **Persiapan Konten:**
   - Siapkan slide presentasi (jika diperlukan)
   - Siapkan script untuk setiap bagian
   - Rehearse sebelum recording
   - Siapkan data dummy untuk demo

3. **Tips Recording:**
   - Gunakan background yang rapi
   - Pastikan pencahayaan cukup
   - Gunakan microphone yang baik untuk audio jelas
   - Recording dengan resolusi minimal 1080p
   - Edit video untuk menghilangkan bagian yang tidak perlu

### Checklist Konten Video:

- [ ] Opening dengan perkenalan tim
- [ ] Overview aplikasi dan fitur utama
- [ ] Demo landing page
- [ ] Demo authentication (login/register)
- [ ] Demo Patient Dashboard
- [ ] Demo booking appointment
- [ ] Demo Doctor Dashboard
- [ ] Demo schedule settings
- [ ] Demo medical records
- [ ] Demo profile dan upload foto
- [ ] Penjelasan tech stack
- [ ] Penjelasan pembagian tugas
- [ ] Informasi deployment
- [ ] Closing

### Durasi Per Bagian:

- **Bagian 1 (PM):** 2 menit
- **Bagian 2 (FE 1):** 3 menit
- **Bagian 3 (FE 2):** 2 menit
- **Bagian 4 (BE 1 & BE 2):** 5-6 menit (dapat disingkat sesuai kebutuhan)
- **Bagian 5 (PM):** 1 menit

**Total: ~13-14 menit** (dapat dipotong bagian backend untuk tetap dalam batas 10 menit jika diperlukan)

---

## 📤 Upload Video

### Platform Upload:

1. **YouTube:**
   - Upload ke channel YouTube (bisa channel pribadi atau tim)
   - Set visibility sesuai requirement (Public/Unlisted)
   - Tambahkan description dengan link aplikasi dan repository
   - Tambahkan tags: #PemrogramanWeb #UAS #ClinicAppointmentSystem

2. **Google Drive:**
   - Upload ke Google Drive
   - Set sharing permission sesuai requirement
   - Pastikan file dapat diakses oleh dosen

### Informasi yang Harus Disertakan:

- Link aplikasi (Frontend & Backend)
- Link repository GitHub
- Nama tim dan anggota
- Tech stack yang digunakan
- Fitur utama aplikasi

---

## 📋 Template Description untuk YouTube/Drive

```
Clinic Appointment System - Video Presentasi UAS Pemrograman Web

Tim: SigmaBoy

Anggota Tim:
1. Mario Fransiskus Sitepu (123140023) - Project Manager
2. Michael Matthew (123140101) - Frontend Developer
3. Anselmus Herpin Hasugian (123140020) - Frontend Developer
4. Febrian Valetino Nugroho (123140034) - Backend Developer
5. Adi Septriansyah (123140021) - Backend Developer

Link Aplikasi:
- Frontend: https://mario-bilang-nama-timnya-sigmaboy-a.vercel.app
- Backend API: https://mario-bilang-nama-timnya-sigmaboy-a.onrender.com

Repository: https://github.com/MarioSitepu/uas-paw-mario-bilang-nama-timnya-sigmaboy-aja-dan-kita-setuju

Tech Stack:
- Frontend: React 19, TypeScript, Tailwind CSS, Vite
- Backend: Python Pyramid, SQLAlchemy
- Database: PostgreSQL (Supabase)
- Deployment: Vercel (Frontend), Render (Backend)

Fitur Utama:
- User Authentication dengan JWT
- Appointment Booking System
- Doctor Management & Schedule
- Medical Records
- Dashboard dengan Analytics
- Google OAuth Login
- Profile Photo Upload

Durasi: ~10 menit
```

---

**Selamat membuat video presentasi! Semoga sukses! 🎬✨**

