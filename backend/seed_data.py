"""
Seed script untuk mengisi database dengan data dummy
Jalankan: python seed_data.py
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, User, Doctor, Appointment, MedicalRecord
from datetime import date, time, datetime, timedelta
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL - sesuaikan dengan development.ini (Neon PostgreSQL)
DATABASE_URL = os.getenv("DATABASE_URL")

# Fix for postgresql://
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# Disable prepared statements for Supabase transaction pooler
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "prepare_threshold": None
    }
)
Session = sessionmaker(bind=engine)
session = Session()

def clear_data():
    """Hapus semua data yang ada"""
    session.query(MedicalRecord).delete()
    session.query(Appointment).delete()
    session.query(Doctor).delete()
    session.query(User).delete()
    session.commit()
    print("[OK] Data lama dihapus")

def create_users():
    """Buat user dummy"""
    users = []
    
    # Admin
    admin = User(
        name="Admin Klinik",
        email="admin@clinic.com",
        role="ADMIN"
    )
    admin.set_password("Admin123!")
    users.append(admin)
    
    # Dokter 1
    doc1 = User(
        name="Dr. Budi Santoso",
        email="budi@clinic.com",
        role="DOCTOR"
    )
    doc1.set_password("Doctor123!")
    users.append(doc1)
    
    # Dokter 2
    doc2 = User(
        name="Dr. Siti Rahayu",
        email="siti@clinic.com",
        role="DOCTOR"
    )
    doc2.set_password("Doctor123!")
    users.append(doc2)
    
    # Dokter 3
    doc3 = User(
        name="Dr. Ahmad Wijaya",
        email="ahmad@clinic.com",
        role="DOCTOR"
    )
    doc3.set_password("Doctor123!")
    users.append(doc3)
    
    # Pasien 1
    patient1 = User(
        name="Andi Pratama",
        email="andi@gmail.com",
        role="PATIENT"
    )
    patient1.set_password("Patient123!")
    users.append(patient1)
    
    # Pasien 2
    patient2 = User(
        name="Dewi Lestari",
        email="dewi@gmail.com",
        role="PATIENT"
    )
    patient2.set_password("Patient123!")
    users.append(patient2)
    
    # Pasien 3
    patient3 = User(
        name="Rizky Firmansyah",
        email="rizky@gmail.com",
        role="PATIENT"
    )
    patient3.set_password("Patient123!")
    users.append(patient3)
    
    # Pasien 4
    patient4 = User(
        name="Maya Putri",
        email="maya@gmail.com",
        role="PATIENT"
    )
    patient4.set_password("Patient123!")
    users.append(patient4)
    
    session.add_all(users)
    session.commit()
    print(f"[OK] {len(users)} users dibuat")
    return users

def create_doctors(users):
    """Buat profil dokter"""
    doctors = []
    
    # Cari user dengan role doctor
    doc_users = [u for u in users if u.role == 'DOCTOR']
    
    # Dokter 1 - Umum
    doctor1 = Doctor(
        user_id=doc_users[0].id,
        specialization="Dokter Umum",
        license_number="STR-001-2024",
        phone="081234567001",
        bio="Dokter umum berpengalaman 10 tahun dengan keahlian dalam penanganan penyakit umum dan konsultasi kesehatan.",
        schedule={
            "monday": ["08:00-12:00", "14:00-17:00"],
            "tuesday": ["08:00-12:00", "14:00-17:00"],
            "wednesday": ["08:00-12:00"],
            "thursday": ["08:00-12:00", "14:00-17:00"],
            "friday": ["08:00-12:00", "14:00-17:00"]
        }
    )
    doctors.append(doctor1)
    
    # Dokter 2 - Spesialis Anak
    doctor2 = Doctor(
        user_id=doc_users[1].id,
        specialization="Spesialis Anak",
        license_number="STR-002-2024",
        phone="081234567002",
        bio="Spesialis anak dengan fokus pada tumbuh kembang anak dan imunisasi.",
        schedule={
            "monday": ["09:00-13:00"],
            "tuesday": ["09:00-13:00", "15:00-18:00"],
            "wednesday": ["09:00-13:00", "15:00-18:00"],
            "thursday": ["09:00-13:00"],
            "friday": ["09:00-13:00", "15:00-18:00"],
            "saturday": ["09:00-12:00"]
        }
    )
    doctors.append(doctor2)
    
    # Dokter 3 - Spesialis Penyakit Dalam
    doctor3 = Doctor(
        user_id=doc_users[2].id,
        specialization="Spesialis Penyakit Dalam",
        license_number="STR-003-2024",
        phone="081234567003",
        bio="Spesialis penyakit dalam dengan pengalaman menangani diabetes, hipertensi, dan gangguan metabolisme.",
        schedule={
            "monday": ["10:00-14:00"],
            "tuesday": ["10:00-14:00"],
            "wednesday": ["10:00-14:00", "16:00-19:00"],
            "thursday": ["10:00-14:00", "16:00-19:00"],
            "friday": ["10:00-14:00"]
        }
    )
    doctors.append(doctor3)
    
    session.add_all(doctors)
    session.commit()
    print(f"[OK] {len(doctors)} profil dokter dibuat")
    return doctors

def create_appointments(users, doctors):
    """Buat appointment dummy yang banyak"""
    appointments = []
    patients = [u for u in users if u.role == 'PATIENT']
    
    today = date.today()
    import random
    
    start_date = today - timedelta(days=30)
    end_date = today + timedelta(days=14)
    
    reasons = [
        "Demam dan batuk", "Pusing kepala", "Sakit perut", "Check up rutin", 
        "Vaksinasi", "Konsultasi gizi", "Sakit gigi", "Luka ringan", 
        "Alergi kulit", "Sesak nafas", "Nyeri sendi", "Insomnia",
        "Gangguan pencernaan", "Mata merah", "Telinga berdenging"
    ]
    
    current_date = start_date
    while current_date <= end_date:
        # Skip Sundays
        if current_date.weekday() == 6:
            current_date += timedelta(days=1)
            continue
            
        for doctor in doctors:
            # 3-6 appointments per doctor per day
            num_appts = random.randint(3, 6)
            
            # Possible hours: 9-16
            hours = random.sample(range(9, 17), num_appts)
            hours.sort()
            
            for h in hours:
                appt_date = current_date
                
                # Determine status based on date
                if appt_date < today:
                    status = random.choice(['completed', 'completed', 'completed', 'cancelled'])
                elif appt_date == today:
                    status = random.choice(['confirmed', 'pending'])
                else:
                    status = random.choice(['pending', 'pending', 'confirmed'])
                
                appt = Appointment(
                    patient_id=random.choice(patients).id,
                    doctor_id=doctor.id,
                    appointment_date=appt_date,
                    appointment_time=time(h, 0),
                    status=status,
                    reason=random.choice(reasons)
                )
                appointments.append(appt)
        
        current_date += timedelta(days=1)
    
    session.add_all(appointments)
    session.commit()
    print(f"[OK] {len(appointments)} appointments dibuat (Auto-generated)")
    return appointments

def create_medical_records(appointments):
    """Buat medical records untuk appointment yang completed"""
    records = []
    
    completed_apts = [a for a in appointments if a.status == 'completed']
    
    if len(completed_apts) >= 1:
        record1 = MedicalRecord(
            appointment_id=completed_apts[0].id,
            diagnosis="ISPA (Infeksi Saluran Pernapasan Akut)",
            symptoms="Demam 38°C, batuk berdahak, pilek",
            treatment="Istirahat cukup, banyak minum air putih",
            prescription="Paracetamol 500mg 3x1, Ambroxol 30mg 3x1, Vitamin C 500mg 1x1",
            notes="Kontrol ulang jika demam tidak turun dalam 3 hari"
        )
        records.append(record1)
    
    if len(completed_apts) >= 2:
        record2 = MedicalRecord(
            appointment_id=completed_apts[1].id,
            diagnosis="Tension Headache",
            symptoms="Sakit kepala bagian depan, tegang pada leher, mata lelah",
            treatment="Kurangi waktu screen time, istirahat cukup, olahraga ringan",
            prescription="Paracetamol 500mg bila perlu, Vitamin B Complex 1x1",
            notes="Hindari stress berlebihan, atur pola tidur"
        )
        records.append(record2)
    
    session.add_all(records)
    session.commit()
    print(f"[OK] {len(records)} medical records dibuat")
    return records

def main():
    print("\n=== Seeding Database ===\n")
    
    # Buat tabel jika belum ada
    Base.metadata.create_all(engine)
    
    # Clear existing data
    clear_data()
    
    # Create data
    users = create_users()
    doctors = create_doctors(users)
    appointments = create_appointments(users, doctors)
    medical_records = create_medical_records(appointments)
    
    print("\n=== Seeding Selesai ===\n")
    print("Akun yang tersedia:")
    print("-" * 50)
    print("ADMIN:")
    print("  Email: admin@clinic.com")
    print("  Password: Admin123!")
    print("-" * 50)
    print("DOKTER:")
    print("  Email: budi@clinic.com | Password: Doctor123!")
    print("  Email: siti@clinic.com | Password: Doctor123!")
    print("  Email: ahmad@clinic.com | Password: Doctor123!")
    print("-" * 50)
    print("PASIEN:")
    print("  Email: andi@gmail.com | Password: Patient123!")
    print("  Email: dewi@gmail.com | Password: Patient123!")
    print("  Email: rizky@gmail.com | Password: Patient123!")
    print("  Email: maya@gmail.com | Password: Patient123!")
    print("-" * 50)

if __name__ == "__main__":
    main()
    session.close()
