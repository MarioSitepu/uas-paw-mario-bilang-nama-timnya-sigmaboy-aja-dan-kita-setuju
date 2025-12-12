from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound, HTTPForbidden, HTTPBadRequest
from ..models import Appointment, Doctor, User
from .auth import get_db_session, require_auth, get_current_user
from datetime import datetime, date, time


@view_config(route_name='api_appointments', request_method='GET', renderer='json')
def get_appointments(request):
    """Mendapatkan daftar appointment berdasarkan role user"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        
        query = session.query(Appointment)
        
        if current_user.role == 'patient':
            # Pasien hanya bisa melihat appointment miliknya
            query = query.filter(Appointment.patient_id == current_user.id)
        elif current_user.role == 'doctor':
            # Dokter melihat appointment yang ditujukan kepadanya
            doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            if doctor:
                query = query.filter(Appointment.doctor_id == doctor.id)
            else:
                return {'appointments': [], 'total': 0}
        # Admin bisa melihat semua
        
        # Filter by status
        status = request.params.get('status')
        if status:
            query = query.filter(Appointment.status == status)
        
        # Filter by date
        date_filter = request.params.get('date')
        if date_filter:
            try:
                filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
                query = query.filter(Appointment.appointment_date == filter_date)
            except ValueError:
                pass
        
        # Order by date and time
        query = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
        
        appointments = query.all()
        
        return {
            'appointments': [apt.to_dict() for apt in appointments],
            'total': len(appointments)
        }
    finally:
        session.close()


@view_config(route_name='api_appointments', request_method='POST', renderer='json')
def create_appointment(request):
    """Membuat appointment baru - hanya untuk pasien"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        
        if current_user.role != 'patient':
            return {'error': 'Hanya pasien yang dapat membuat appointment'}
        
        data = request.json_body
        
        # Validasi field yang diperlukan
        required_fields = ['doctor_id', 'appointment_date', 'appointment_time']
        for field in required_fields:
            if not data.get(field):
                return {'error': f'{field} harus diisi'}
        
        # Cek apakah dokter ada
        doctor = session.query(Doctor).filter(Doctor.id == data['doctor_id']).first()
        if not doctor:
            return {'error': 'Dokter tidak ditemukan'}
        
        # Parse tanggal dan waktu
        try:
            apt_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
            apt_time = datetime.strptime(data['appointment_time'], '%H:%M').time()
        except ValueError:
            return {'error': 'Format tanggal atau waktu tidak valid'}
        
        # Cek apakah tanggal sudah lewat
        if apt_date < date.today():
            return {'error': 'Tidak dapat membuat appointment untuk tanggal yang sudah lewat'}
        
        # Cek konflik jadwal
        existing = session.query(Appointment).filter(
            Appointment.doctor_id == data['doctor_id'],
            Appointment.appointment_date == apt_date,
            Appointment.appointment_time == apt_time,
            Appointment.status.in_(['pending', 'confirmed'])
        ).first()
        
        if existing:
            return {'error': 'Jadwal tersebut sudah terisi, silakan pilih waktu lain'}
        
        # Buat appointment baru
        appointment = Appointment(
            patient_id=current_user.id,
            doctor_id=data['doctor_id'],
            appointment_date=apt_date,
            appointment_time=apt_time,
            status='pending',
            reason=data.get('reason'),
            notes=data.get('notes')
        )
        
        session.add(appointment)
        session.commit()
        
        return {
            'message': 'Appointment berhasil dibuat',
            'appointment': appointment.to_dict()
        }
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()


@view_config(route_name='api_appointment', request_method='GET', renderer='json')
def get_appointment(request):
    """Mendapatkan detail appointment berdasarkan ID"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        appointment_id = int(request.matchdict['id'])
        
        appointment = session.query(Appointment).filter(Appointment.id == appointment_id).first()
        
        if not appointment:
            return {'error': 'Appointment tidak ditemukan'}
        
        # Cek akses
        if current_user.role == 'patient' and appointment.patient_id != current_user.id:
            return {'error': 'Anda tidak memiliki akses ke appointment ini'}
        elif current_user.role == 'doctor':
            doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            if not doctor or appointment.doctor_id != doctor.id:
                return {'error': 'Anda tidak memiliki akses ke appointment ini'}
        
        return {'appointment': appointment.to_dict()}
    finally:
        session.close()


@view_config(route_name='api_appointment', request_method='PUT', renderer='json')
def update_appointment(request):
    """Update appointment - reschedule atau update status"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        appointment_id = int(request.matchdict['id'])
        
        appointment = session.query(Appointment).filter(Appointment.id == appointment_id).first()
        
        if not appointment:
            return {'error': 'Appointment tidak ditemukan'}
        
        # Cek akses
        is_patient = current_user.role == 'patient' and appointment.patient_id == current_user.id
        is_doctor = False
        if current_user.role == 'doctor':
            doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            is_doctor = doctor and appointment.doctor_id == doctor.id
        is_admin = current_user.role == 'admin'
        
        if not (is_patient or is_doctor or is_admin):
            return {'error': 'Anda tidak memiliki akses untuk mengubah appointment ini'}
        
        data = request.json_body
        
        # Update status (hanya dokter atau admin)
        if 'status' in data and (is_doctor or is_admin):
            valid_statuses = ['pending', 'confirmed', 'completed', 'cancelled']
            if data['status'] in valid_statuses:
                appointment.status = data['status']
        
        # Update jadwal (reschedule) - jika masih pending atau confirmed
        if appointment.can_be_modified():
            if 'appointment_date' in data:
                try:
                    appointment.appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
                except ValueError:
                    return {'error': 'Format tanggal tidak valid'}
            
            if 'appointment_time' in data:
                try:
                    appointment.appointment_time = datetime.strptime(data['appointment_time'], '%H:%M').time()
                except ValueError:
                    return {'error': 'Format waktu tidak valid'}
            
            if 'reason' in data:
                appointment.reason = data['reason']
            
            if 'notes' in data:
                appointment.notes = data['notes']
        
        session.commit()
        
        return {
            'message': 'Appointment berhasil diperbarui',
            'appointment': appointment.to_dict()
        }
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()


@view_config(route_name='api_appointment', request_method='DELETE', renderer='json')
def cancel_appointment(request):
    """Membatalkan appointment"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        appointment_id = int(request.matchdict['id'])
        
        appointment = session.query(Appointment).filter(Appointment.id == appointment_id).first()
        
        if not appointment:
            return {'error': 'Appointment tidak ditemukan'}
        
        # Cek akses
        is_patient = current_user.role == 'patient' and appointment.patient_id == current_user.id
        is_doctor = False
        if current_user.role == 'doctor':
            doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            is_doctor = doctor and appointment.doctor_id == doctor.id
        is_admin = current_user.role == 'admin'
        
        if not (is_patient or is_doctor or is_admin):
            return {'error': 'Anda tidak memiliki akses untuk membatalkan appointment ini'}
        
        if not appointment.can_be_modified():
            return {'error': 'Appointment ini tidak dapat dibatalkan'}
        
        appointment.status = 'cancelled'
        session.commit()
        
        return {'message': 'Appointment berhasil dibatalkan'}
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()


@view_config(route_name='api_appointments_today', request_method='GET', renderer='json')
def get_today_appointments(request):
    """Mendapatkan appointment hari ini untuk dashboard dokter"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        
        if current_user.role != 'doctor':
            return {'error': 'Hanya dokter yang dapat mengakses endpoint ini'}
        
        doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            return {'appointments': [], 'total': 0}
        
        today = date.today()
        
        appointments = session.query(Appointment).filter(
            Appointment.doctor_id == doctor.id,
            Appointment.appointment_date == today
        ).order_by(Appointment.appointment_time).all()
        
        return {
            'date': today.isoformat(),
            'appointments': [apt.to_dict() for apt in appointments],
            'total': len(appointments)
        }
    finally:
        session.close()


@view_config(route_name='api_patient_history', request_method='GET', renderer='json')
def get_patient_history(request):
    """Mendapatkan riwayat appointment pasien"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        
        if current_user.role != 'patient':
            return {'error': 'Hanya pasien yang dapat mengakses endpoint ini'}
        
        appointments = session.query(Appointment).filter(
            Appointment.patient_id == current_user.id
        ).order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).all()
        
        # Pisahkan upcoming dan past
        today = date.today()
        upcoming = []
        past = []
        
        for apt in appointments:
            if apt.appointment_date >= today and apt.status in ['pending', 'confirmed']:
                upcoming.append(apt.to_dict())
            else:
                past.append(apt.to_dict())
        
        return {
            'upcoming': upcoming,
            'past': past,
            'total_upcoming': len(upcoming),
            'total_past': len(past)
        }
    finally:
        session.close()
