from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound, HTTPForbidden
from ..models import Doctor, User, Appointment
from .auth import get_db_session, require_auth, require_role, get_current_user
from datetime import datetime, time, timedelta


@view_config(route_name='api_doctors', request_method='GET', renderer='json')
def get_doctors(request):
    """Mendapatkan daftar semua dokter dengan filter opsional"""
    session = get_db_session(request)
    try:
        query = session.query(Doctor)
        
        # Filter by specialization
        specialization = request.params.get('specialization')
        if specialization:
            query = query.filter(Doctor.specialization.ilike(f'%{specialization}%'))
        
        doctors = query.all()
        
        # Convert doctors to dict and normalize schedule
        doctors_data = []
        for doc in doctors:
            doc_dict = doc.to_dict(include_user=True)
            
            # Normalize schedule keys from numbers to day names if needed
            if doc_dict['schedule'] and isinstance(doc_dict['schedule'], dict):
                normalized_schedule = {}
                days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                
                for key, value in doc_dict['schedule'].items():
                    # If key is a number (0-6), convert to day name
                    if key.isdigit():
                        day_index = int(key)
                        if 0 <= day_index <= 6:
                            day_name = days[day_index]
                            normalized_schedule[day_name] = value
                    else:
                        # Already a day name, just use it
                        normalized_schedule[key.lower()] = value
                
                # Ensure all days are present
                for day in days:
                    if day not in normalized_schedule:
                        normalized_schedule[day] = {
                            'available': day not in ['saturday', 'sunday'],
                            'startTime': '09:00' if day not in ['saturday', 'sunday'] else '',
                            'endTime': '17:00' if day not in ['saturday', 'sunday'] else '',
                            'breakStart': '',
                            'breakEnd': ''
                        }
                
                doc_dict['schedule'] = normalized_schedule
            
            doctors_data.append(doc_dict)
        
        return {
            'doctors': doctors_data,
            'total': len(doctors)
        }
    finally:
        session.close()


@view_config(route_name='api_doctor', request_method='GET', renderer='json')
def get_doctor(request):
    """Mendapatkan detail dokter berdasarkan ID"""
    session = get_db_session(request)
    try:
        doctor_id = int(request.matchdict['id'])
        doctor = session.query(Doctor).filter(Doctor.id == doctor_id).first()
        
        if not doctor:
            request.response.status_int = 404
            return {'error': 'Dokter tidak ditemukan'}
        
        doc_dict = doctor.to_dict(include_user=True)
        
        # Normalize schedule keys from numbers to day names if needed
        if doc_dict.get('schedule') and isinstance(doc_dict['schedule'], dict):
            normalized_schedule = {}
            days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            
            for key, value in doc_dict['schedule'].items():
                # If key is a number (0-6), convert to day name
                if str(key).isdigit():
                    day_index = int(key)
                    if 0 <= day_index <= 6:
                        day_name = days[day_index]
                        normalized_schedule[day_name] = value
                else:
                    # Already a day name, just use it
                    normalized_schedule[str(key).lower()] = value
            
            doc_dict['schedule'] = normalized_schedule
        
        return doc_dict
    finally:
        session.close()


@view_config(route_name='api_doctor', request_method='PUT', renderer='json')
def update_doctor(request):
    """Update profil dokter - hanya dokter itu sendiri atau admin"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        if not current_user:
            return {'error': 'Unauthorized - please login'}
        
        doctor_id = int(request.matchdict['id'])
        
        doctor = session.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            request.response.status_int = 404
            return {'error': 'Dokter tidak ditemukan'}
        
        # Cek akses: hanya dokter yang bersangkutan atau admin
        if current_user.role.lower() != 'admin' and doctor.user_id != current_user.id:
            request.response.status_int = 403
            return {'error': 'Anda tidak memiliki akses untuk mengubah profil ini'}
        
        data = request.json_body
        
        # Update fields
        if 'specialization' in data:
            doctor.specialization = data['specialization']
        if 'phone' in data:
            doctor.phone = data['phone']
        if 'bio' in data:
            doctor.bio = data['bio']
        if 'schedule' in data:
            doctor.schedule = data['schedule']
        if 'license_number' in data:
            # Convert empty string to None to avoid unique constraint violation
            license_number = data['license_number']
            doctor.license_number = license_number if license_number and license_number.strip() else None
        
        session.commit()
        
        return doctor.to_dict(include_user=True)
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()


@view_config(route_name='api_doctor_schedule', request_method='GET', renderer='json')
def get_doctor_schedule(request):
    """Mendapatkan jadwal praktek dokter"""
    session = get_db_session(request)
    try:
        doctor_id = int(request.matchdict['id'])
        doctor = session.query(Doctor).filter(Doctor.id == doctor_id).first()
        
        if not doctor:
            return {'error': 'Dokter tidak ditemukan'}
        
        # If schedule is empty, return default schedule
        schedule = doctor.schedule or {}
        
        # Ensure all days are present with valid structure
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        for day in days:
            if day not in schedule:
                schedule[day] = {
                    'available': day not in ['saturday', 'sunday'],  # Default: weekdays only
                    'startTime': '08:00' if day not in ['saturday', 'sunday'] else '',
                    'endTime': '16:00' if day not in ['saturday', 'sunday'] else '',
                    'breakStart': '',
                    'breakEnd': ''
                }
            else:
                # Clean up: ensure break times are consistent
                day_data = schedule[day]
                break_start = day_data.get('breakStart', '').strip() if day_data.get('breakStart') else ''
                break_end = day_data.get('breakEnd', '').strip() if day_data.get('breakEnd') else ''
                
                # If one is empty but the other isn't, reset both
                if (break_start and not break_end) or (not break_start and break_end):
                    print(f'🧹 Cleaning inconsistent break time for {day}: "{break_start}" - "{break_end}" → empty')
                    day_data['breakStart'] = ''
                    day_data['breakEnd'] = ''
                else:
                    # Just ensure they're truly empty if not set
                    day_data['breakStart'] = break_start
                    day_data['breakEnd'] = break_end
        
        return {
            'doctor_id': doctor.id,
            'doctor_name': doctor.user.name if doctor.user else None,
            'specialization': doctor.specialization,
            'schedule': schedule
        }
    finally:
        session.close()


@view_config(route_name='api_doctor_schedule', request_method='PUT', renderer='json')
def update_doctor_schedule(request):
    """Update jadwal praktek dokter"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        doctor_id = int(request.matchdict['id'])
        
        doctor = session.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            request.response.status_int = 404
            return {'error': 'Dokter tidak ditemukan'}
        
        # Cek akses
        if current_user.role.lower() != 'admin' and doctor.user_id != current_user.id:
            request.response.status_int = 403
            return {'error': 'Anda tidak memiliki akses untuk mengubah jadwal ini'}
        
        data = request.json_body
        schedule_data = data.get('schedule', {})
        
        # Clean up schedule - ensure empty break times are truly empty strings
        cleaned_schedule = {}
        for day, day_data in schedule_data.items():
            if isinstance(day_data, dict):
                cleaned_schedule[day] = {
                    'available': bool(day_data.get('available', False)),
                    'startTime': day_data.get('startTime', '') if day_data.get('available') else '',
                    'endTime': day_data.get('endTime', '') if day_data.get('available') else '',
                    'breakStart': day_data.get('breakStart', '') or '',  # Ensure truly empty
                    'breakEnd': day_data.get('breakEnd', '') or ''  # Ensure truly empty
                }
        
        doctor.schedule = cleaned_schedule
        session.commit()
        
        return {
            'message': 'Jadwal dokter berhasil diperbarui',
            'schedule': doctor.schedule
        }
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()


@view_config(route_name='api_specializations', request_method='GET', renderer='json')
def get_specializations(request):
    """Mendapatkan daftar semua spesialisasi yang tersedia"""
    session = get_db_session(request)
    try:
        doctors = session.query(Doctor.specialization).distinct().all()
        specializations = [doc.specialization for doc in doctors if doc.specialization]
        
        return {'specializations': sorted(set(specializations))}
    finally:
        session.close()

@view_config(route_name='api_doctor_slots', request_method='GET', renderer='json')
def get_doctor_slots(request):
    """Mendapatkan slot waktu yang tersedia untuk dokter pada tanggal tertentu"""
    session = get_db_session(request)
    try:
        doctor_id = int(request.matchdict['id'])
        date_str = request.params.get('date')
        
        if not date_str:
            request.response.status_int = 400
            return {'error': 'Parameter tanggal diperlukan'}
            
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            request.response.status_int = 400
            return {'error': 'Format tanggal tidak valid (gunakan YYYY-MM-DD)'}
        
        # Validasi: tidak bisa booking untuk tanggal yang sudah lewat
        today = datetime.now().date()
        if target_date < today:
            request.response.status_int = 400
            return {'error': 'Tidak dapat memilih tanggal yang sudah lewat'}
            
        doctor = session.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            request.response.status_int = 404
            return {'error': 'Dokter tidak ditemukan'}
            
        # Get doctor's schedule for the day
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        day_name = days[target_date.weekday()]
        
        schedule = doctor.schedule or {}
        # Handle key number vs string logic again just in case
        day_schedule = schedule.get(day_name)
        if not day_schedule and str(target_date.weekday()) in schedule:
             day_schedule = schedule.get(str(target_date.weekday()))
             
        if not day_schedule:
             # Try default if not found
             day_schedule = {
                'available': day_name not in ['saturday', 'sunday'],
                'startTime': '09:00',
                'endTime': '17:00',
                'breakStart': '',
                'breakEnd': ''
             }

        if not day_schedule.get('available', False):
            return [] # No slots if not available
            
        start_time_str = day_schedule.get('startTime', '').strip()
        end_time_str = day_schedule.get('endTime', '').strip()
        break_start_str = day_schedule.get('breakStart', '').strip()
        break_end_str = day_schedule.get('breakEnd', '').strip()
        
        if not start_time_str or not end_time_str:
            return []
            
        # Helper to parse time
        def parse_time(t_str):
            """Parse time string HH:MM to time object"""
            if not t_str or len(t_str.strip()) == 0:
                return None
            parts = t_str.split(':')
            if len(parts) != 2:
                raise ValueError(f"Invalid time format: {t_str}")
            h, m = int(parts[0]), int(parts[1])
            if not (0 <= h <= 23 and 0 <= m <= 59):
                raise ValueError(f"Invalid time values: {t_str}")
            return time(h, m)
            
        try:
            start_time = parse_time(start_time_str)
            end_time = parse_time(end_time_str)
            
            if not start_time or not end_time:
                return []
            
            # Validate start < end
            if start_time >= end_time:
                return []
            
            break_start = parse_time(break_start_str) if break_start_str else None
            break_end = parse_time(break_end_str) if break_end_str else None
            
            # Validate break time if both are provided
            if break_start and break_end:
                if break_start >= break_end:
                    # Invalid break time, ignore it
                    break_start = None
                    break_end = None
        except (ValueError, TypeError) as e:
            print(f"Error parsing schedule times: {e}")
            return [] # Invalid time format in schedule
        
        # Get existing appointments
        appointments = session.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == target_date,
            Appointment.status.in_(['pending', 'confirmed'])
        ).all()
        
        taken_times = {apt.appointment_time for apt in appointments}
        
        # Generate slots (30 minutes interval for better flexibility)
        slots = []
        current_time = datetime.combine(target_date, start_time)
        end_datetime = datetime.combine(target_date, end_time)
        
        # Slot duration 30 mins (more flexible than 60 mins)
        slot_duration = 30
        
        while current_time < end_datetime:
            slot_time = current_time.time()
            
            # Check if in break
            in_break = False
            if break_start and break_end:
                if break_start <= slot_time < break_end:
                    in_break = True
            
            # Check if taken
            is_taken = slot_time in taken_times
            
            # Only add valid slots (not in break)
            if not in_break:
                slots.append({
                    'time': slot_time.strftime('%H:%M'),
                    'available': not is_taken
                })
            
            current_time += timedelta(minutes=slot_duration)
            
        return slots
        
    except ValueError as e:
        request.response.status_int = 400
        return {'error': f'Parameter tidak valid: {str(e)}'}
    except Exception as e:
        print(f"Error in get_doctor_slots: {e}")
        request.response.status_int = 500
        return {'error': 'Terjadi kesalahan saat memuat slot waktu'}
    finally:
        session.close()
