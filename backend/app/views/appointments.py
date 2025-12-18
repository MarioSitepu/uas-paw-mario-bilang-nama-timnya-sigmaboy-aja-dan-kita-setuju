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
        current_user = get_current_user(request)
        
        if not current_user:
            request.response.status_int = 401
            return {'error': 'Authentication required'}
        
        query = session.query(Appointment)
        
        # Normalize role to lowercase
        user_role = current_user.role.lower() if current_user.role else ''
        
        if user_role == 'patient':
            # Pasien hanya bisa melihat appointment miliknya
            query = query.filter(Appointment.patient_id == current_user.id)
        elif user_role == 'doctor':
            # Dokter melihat appointment yang ditujukan kepadanya
            doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            print(f"DEBUG GET: current_user.id={current_user.id}, doctor={doctor}")
            if doctor:
                print(f"DEBUG GET: doctor.id={doctor.id}, filtering by doctor_id")
                query = query.filter(Appointment.doctor_id == doctor.id)
            else:
                print(f"DEBUG GET: No doctor profile found for user_id={current_user.id}")
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
        # Get current user
        from .auth import get_current_user
        current_user = get_current_user(request)
        
        # Check authentication
        if not current_user:
            request.response.status_int = 401
            return {'error': 'Authentication required'}
        
        # Debug logging
        print(f"DEBUG: current_user = {current_user}")
        print(f"DEBUG: current_user.id = {current_user.id}")
        print(f"DEBUG: current_user.role = {current_user.role}")
        print(f"DEBUG: current_user.role type = {type(current_user.role)}")
        
        # Normalize role to lowercase for comparison
        user_role = current_user.role.lower() if current_user.role else ''
        
        if user_role != 'patient':
            return {'error': f'Hanya pasien yang dapat membuat appointment (your role: {current_user.role})'}
        
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
        
        # Validasi jadwal dokter - cek apakah waktu termasuk break time
        doctor_schedule = doctor.schedule or {}
        # Python weekday: 0=Monday, 1=Tuesday, ... 6=Sunday
        # But our schedule uses: monday, tuesday, ... sunday
        # So we need to convert: weekday 0-6 (Mon-Sun) to day name
        day_names = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        day_of_week = day_names[apt_date.weekday()]
        day_schedule = doctor_schedule.get(day_of_week, {})
        
        print(f'🔍 Appointment validation:')
        print(f'  Date: {apt_date} (weekday={apt_date.weekday()}, day_name={day_of_week})')
        print(f'  Time: {apt_time}')
        print(f'  Doctor schedule: {doctor_schedule}')
        print(f'  Day schedule: {day_schedule}')
        
        # Cek apakah dokter tersedia pada hari itu
        if not day_schedule.get('available', False):
            return {'error': 'Dokter tidak tersedia pada tanggal yang dipilih'}
        
        # Cek apakah waktu berada dalam jam kerja dokter
        start_time = day_schedule.get('startTime', '')
        end_time = day_schedule.get('endTime', '')
        
        if start_time and end_time:
            start_hour, start_min = map(int, start_time.split(':'))
            end_hour, end_min = map(int, end_time.split(':'))
            apt_hour, apt_min = apt_time.hour, apt_time.minute
            
            start_minutes = start_hour * 60 + start_min
            end_minutes = end_hour * 60 + end_min
            apt_minutes = apt_hour * 60 + apt_min
            
            if apt_minutes < start_minutes or apt_minutes >= end_minutes:
                return {'error': f'Waktu tidak termasuk jam kerja dokter ({start_time} - {end_time})'}
            
            # Cek apakah waktu berada dalam break time
            break_start = day_schedule.get('breakStart', '')
            break_end = day_schedule.get('breakEnd', '')
            
            if break_start and break_end and len(break_start) > 0 and len(break_end) > 0:
                break_start_hour, break_start_min = map(int, break_start.split(':'))
                break_end_hour, break_end_min = map(int, break_end.split(':'))
                
                break_start_minutes = break_start_hour * 60 + break_start_min
                break_end_minutes = break_end_hour * 60 + break_end_min
                
                if break_start_minutes <= apt_minutes < break_end_minutes:
                    return {'error': f'Waktu termasuk dalam break time dokter ({break_start} - {break_end})'}
        
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
        
        print(f"DEBUG CREATE: Created appointment id={appointment.id}, patient_id={appointment.patient_id}, doctor_id={appointment.doctor_id}")
        
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
        print(f"DEBUG PUT: Starting update appointment")
        current_user = require_auth(request)
        appointment_id = int(request.matchdict['id'])
        print(f"DEBUG PUT: Appointment ID={appointment_id}, User ID={current_user.id}")
        
        appointment = session.query(Appointment).filter(Appointment.id == appointment_id).first()
        
        if not appointment:
            print(f"DEBUG PUT: Appointment {appointment_id} not found")
            return {'error': 'Appointment tidak ditemukan'}
        
        print(f"DEBUG PUT: Found appointment, status={appointment.status}, patient_id={appointment.patient_id}, doctor_id={appointment.doctor_id}")
        
        # Normalize role to lowercase
        user_role = current_user.role.lower() if current_user.role else ''
        print(f"DEBUG PUT: User role (normalized)={user_role}")
        
        # Cek akses
        is_patient = user_role == 'patient' and appointment.patient_id == current_user.id
        is_doctor = False
        if user_role == 'doctor':
            doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            is_doctor = doctor and appointment.doctor_id == doctor.id
        is_admin = user_role == 'admin'
        
        print(f"DEBUG PUT: Access check - is_patient={is_patient}, is_doctor={is_doctor}, is_admin={is_admin}")
        
        if not (is_patient or is_doctor or is_admin):
            print(f"DEBUG PUT: Access denied")
            return {'error': 'Anda tidak memiliki akses untuk mengubah appointment ini'}
        
        data = request.json_body
        print(f"DEBUG PUT: Request data: {data}")
        
        # Update status (hanya dokter atau admin)
        if 'status' in data and (is_doctor or is_admin):
            print(f"DEBUG PUT: Updating status to {data['status']}")
            valid_statuses = ['pending', 'confirmed', 'completed', 'cancelled']
            if data['status'] in valid_statuses:
                appointment.status = data['status']
        
        # Update jadwal (reschedule) - jika masih pending atau confirmed
        can_modify = appointment.can_be_modified()
        print(f"DEBUG PUT: can_be_modified()={can_modify}, status={appointment.status}")
        
        if can_modify:
            if 'appointment_date' in data:
                print(f"DEBUG PUT: Updating appointment_date from {appointment.appointment_date} to {data['appointment_date']}")
                try:
                    appointment.appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
                except ValueError as e:
                    print(f"DEBUG PUT: Date format error: {str(e)}")
                    return {'error': 'Format tanggal tidak valid'}
            
            if 'appointment_time' in data:
                print(f"DEBUG PUT: Updating appointment_time from {appointment.appointment_time} to {data['appointment_time']}")
                try:
                    appointment.appointment_time = datetime.strptime(data['appointment_time'], '%H:%M').time()
                except ValueError as e:
                    print(f"DEBUG PUT: Time format error: {str(e)}")
                    return {'error': 'Format waktu tidak valid'}
            
            if 'reason' in data:
                print(f"DEBUG PUT: Updating reason")
                appointment.reason = data['reason']
            
            if 'notes' in data:
                print(f"DEBUG PUT: Updating notes")
                appointment.notes = data['notes']
        else:
            print(f"DEBUG PUT: Cannot modify appointment - status is {appointment.status}")
        
        session.commit()
        print(f"DEBUG PUT: Successfully committed changes")
        
        return {
            'message': 'Appointment berhasil diperbarui',
            'appointment': appointment.to_dict()
        }
    except Exception as e:
        print(f"DEBUG PUT: Exception: {str(e)}")
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()


@view_config(route_name='api_appointment', request_method='DELETE', renderer='json')
def cancel_appointment(request):
    """Membatalkan appointment"""
    session = get_db_session(request)
    try:
        print(f"DEBUG DELETE: Request to cancel appointment")
        current_user = get_current_user(request)
        
        if not current_user:
            print(f"DEBUG DELETE: No current user found")
            request.response.status_int = 401
            return {'error': 'Authentication required'}
        
        appointment_id = int(request.matchdict['id'])
        print(f"DEBUG DELETE: Appointment ID={appointment_id}, Current user ID={current_user.id}")
        
        appointment = session.query(Appointment).filter(Appointment.id == appointment_id).first()
        
        if not appointment:
            print(f"DEBUG DELETE: Appointment {appointment_id} not found")
            return {'error': 'Appointment tidak ditemukan'}
        
        print(f"DEBUG DELETE: Found appointment, patient_id={appointment.patient_id}, status={appointment.status}")
        
        # Normalize role to lowercase
        user_role = current_user.role.lower() if current_user.role else ''
        print(f"DEBUG DELETE: User role (normalized)={user_role}")
        
        # Cek akses
        is_patient = user_role == 'patient' and appointment.patient_id == current_user.id
        is_doctor = False
        if user_role == 'doctor':
            doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            is_doctor = doctor and appointment.doctor_id == doctor.id
        is_admin = user_role == 'admin'
        
        print(f"DEBUG DELETE: Access check - is_patient={is_patient}, is_doctor={is_doctor}, is_admin={is_admin}")
        
        if not (is_patient or is_doctor or is_admin):
            print(f"DEBUG DELETE: User does not have access")
            return {'error': 'Anda tidak memiliki akses untuk membatalkan appointment ini'}
        
        # Can only cancel if status is pending or confirmed (not already cancelled or completed)
        if appointment.status not in ['pending', 'confirmed']:
            print(f"DEBUG DELETE: Appointment cannot be cancelled - current status={appointment.status}")
            return {'error': f'Appointment dengan status {appointment.status} tidak dapat dibatalkan'}
        
        print(f"DEBUG DELETE: Setting appointment status to cancelled")
        appointment.status = 'cancelled'
        session.commit()
        
        print(f"DEBUG DELETE: Successfully cancelled appointment {appointment_id}")
        return {'message': 'Appointment berhasil dibatalkan'}
    except Exception as e:
        print(f"DEBUG DELETE: Exception: {str(e)}")
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
