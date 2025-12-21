from pyramid.view import view_config
from pyramid.response import Response
from ..models import User, Doctor, Appointment
from .auth import get_db_session, get_current_user, require_auth
from datetime import date
import json

# Import all view modules to ensure they are discovered by config.scan()
from . import appointments
from . import doctors
from . import health
from . import messages
from . import notifications
from . import profile
from . import medical_records
from . import upload


@view_config(route_name='home', request_method='GET', renderer='json')
def home(request):
    """API Home - Welcome message dan status"""
    return {
        'message': 'Selamat datang di Clinic Appointment System API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth',
            'doctors': '/api/doctors',
            'appointments': '/api/appointments',
            'medical_records': '/api/medical-records',
            'dashboard': '/api/dashboard'
        }
    }


@view_config(route_name='api_users', request_method='GET', renderer='json')
def get_users(request):
    """Mendapatkan daftar semua users - hanya admin"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        
        if current_user.role != 'admin':
            return {'error': 'Hanya admin yang dapat mengakses endpoint ini'}
        
        users = session.query(User).all()
        
        return {
            'users': [user.to_dict() for user in users],
            'total': len(users)
        }
    finally:
        session.close()


@view_config(route_name='api_users', request_method='POST', renderer='json')
def create_user(request):
    """Membuat user baru - hanya admin yang dapat membuat role selain patient"""
    session = get_db_session(request)
    try:
        data = request.json_body
        
        # Validation
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return {'error': f'{field} harus diisi'}
        
        # Check email uniqueness
        existing = session.query(User).filter(User.email == data['email']).first()
        if existing:
            return {'error': 'Email sudah terdaftar'}
        
        # Check if trying to create non-patient role
        role = data.get('role', 'patient')
        if role in ['doctor', 'admin']:
            current_user = get_current_user(request)
            if not current_user or current_user.role != 'admin':
                return {'error': 'Hanya admin yang dapat membuat akun dokter atau admin'}
        
        # Create user
        user = User(
            name=data['name'],
            email=data['email'],
            role=role
        )
        user.set_password(data['password'])
        
        session.add(user)
        session.flush()
        
        # If creating doctor, create doctor profile
        if role == 'doctor':
            doctor = Doctor(
                user_id=user.id,
                specialization=data.get('specialization', 'General'),
                phone=data.get('phone'),
                bio=data.get('bio'),
                schedule=data.get('schedule', {})
            )
            session.add(doctor)
        
        session.commit()
        
        return {
            'message': 'User berhasil dibuat',
            'user': user.to_dict()
        }
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()


@view_config(route_name='api_user', request_method='GET', renderer='json')
def get_user(request):
    """Mendapatkan detail user berdasarkan ID"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        user_id = int(request.matchdict['id'])
        
        # Permissive check: allow if admin, self, or if there's an appointment relationship
        is_allowed = False
        if current_user.role == 'admin' or current_user.id == user_id:
            is_allowed = True
        else:
            # Check for appointment relationship
            if current_user.role == 'doctor':
                doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
                if doctor:
                    exists = session.query(Appointment).filter(
                        Appointment.doctor_id == doctor.id,
                        Appointment.patient_id == user_id
                    ).first()
                    if exists:
                        is_allowed = True
            elif current_user.role == 'patient':
                exists = session.query(Appointment).filter(
                    Appointment.patient_id == current_user.id
                ).join(Doctor).filter(Doctor.user_id == user_id).first()
                if exists:
                    is_allowed = True

        if not is_allowed:
            return {'error': 'Anda tidak memiliki akses ke profil ini'}
        
        user = session.query(User).filter(User.id == user_id).first()
        
        if not user:
            return {'error': 'User tidak ditemukan'}
        
        return {'user': user.to_dict()}
    finally:
        session.close()


@view_config(route_name='api_user', request_method='PUT', renderer='json')
def update_user(request):
    """Update profil user"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        user_id = int(request.matchdict['id'])
        
        # Hanya bisa update profil sendiri kecuali admin
        if current_user.role != 'admin' and current_user.id != user_id:
            return {'error': 'Anda tidak memiliki akses untuk mengubah profil ini'}
        
        user = session.query(User).filter(User.id == user_id).first()
        
        if not user:
            return {'error': 'User tidak ditemukan'}
        
        data = request.json_body
        
        # Update fields
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            # Check email uniqueness
            existing = session.query(User).filter(User.email == data['email'], User.id != user_id).first()
            if existing:
                return {'error': 'Email sudah digunakan'}
            user.email = data['email']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        session.commit()
        
        return {
            'message': 'Profil berhasil diperbarui',
            'user': user.to_dict()
        }
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()


@view_config(route_name='api_user', request_method='DELETE', renderer='json')
def delete_user(request):
    """Menghapus user - hanya admin"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        user_id = int(request.matchdict['id'])
        
        if current_user.role != 'admin':
            return {'error': 'Hanya admin yang dapat menghapus user'}
        
        if current_user.id == user_id:
            return {'error': 'Tidak dapat menghapus akun sendiri'}
        
        user = session.query(User).filter(User.id == user_id).first()
        
        if not user:
            return {'error': 'User tidak ditemukan'}
        
        session.delete(user)
        session.commit()
        
        return {'message': 'User berhasil dihapus'}
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()


@view_config(route_name='api_dashboard', request_method='GET', renderer='json')
def get_dashboard(request):
    """Mendapatkan data dashboard berdasarkan role user"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        today = date.today()
        
        if current_user.role == 'patient':
            # Dashboard pasien
            upcoming_appointments = session.query(Appointment).filter(
                Appointment.patient_id == current_user.id,
                Appointment.appointment_date >= today,
                Appointment.status.in_(['pending', 'confirmed'])
            ).order_by(Appointment.appointment_date, Appointment.appointment_time).limit(5).all()
            
            total_appointments = session.query(Appointment).filter(
                Appointment.patient_id == current_user.id
            ).count()
            
            completed_appointments = session.query(Appointment).filter(
                Appointment.patient_id == current_user.id,
                Appointment.status == 'completed'
            ).count()
            
            return {
                'role': 'patient',
                'user': current_user.to_dict(),
                'stats': {
                    'total_appointments': total_appointments,
                    'completed_appointments': completed_appointments,
                    'upcoming_count': len(upcoming_appointments)
                },
                'upcoming_appointments': [apt.to_dict() for apt in upcoming_appointments]
            }
        
        elif current_user.role == 'doctor':
            # Dashboard dokter
            doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            
            if not doctor:
                return {'error': 'Profil dokter tidak ditemukan'}
            
            today_appointments = session.query(Appointment).filter(
                Appointment.doctor_id == doctor.id,
                Appointment.appointment_date == today
            ).order_by(Appointment.appointment_time).all()
            
            pending_appointments = session.query(Appointment).filter(
                Appointment.doctor_id == doctor.id,
                Appointment.status == 'pending'
            ).count()
            
            total_patients = session.query(Appointment.patient_id).filter(
                Appointment.doctor_id == doctor.id
            ).distinct().count()
            
            return {
                'role': 'doctor',
                'user': current_user.to_dict(),
                'doctor': doctor.to_dict(),
                'stats': {
                    'today_appointments': len(today_appointments),
                    'pending_appointments': pending_appointments,
                    'total_patients': total_patients
                },
                'today_schedule': [apt.to_dict() for apt in today_appointments]
            }
        
        elif current_user.role == 'admin':
            # Dashboard admin
            total_users = session.query(User).count()
            total_doctors = session.query(Doctor).count()
            total_patients = session.query(User).filter(User.role == 'patient').count()
            total_appointments = session.query(Appointment).count()
            today_appointments = session.query(Appointment).filter(
                Appointment.appointment_date == today
            ).count()
            
            return {
                'role': 'admin',
                'user': current_user.to_dict(),
                'stats': {
                    'total_users': total_users,
                    'total_doctors': total_doctors,
                    'total_patients': total_patients,
                    'total_appointments': total_appointments,
                    'today_appointments': today_appointments
                }
            }
        
        return {'error': 'Role tidak valid'}
    finally:
        session.close()