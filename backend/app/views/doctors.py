from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound, HTTPForbidden
from ..models import Doctor, User
from .auth import get_db_session, require_auth, require_role, get_current_user


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
            return {'error': 'Dokter tidak ditemukan'}
        
        # Cek akses: hanya dokter yang bersangkutan atau admin
        if current_user.role.lower() != 'admin' and doctor.user_id != current_user.id:
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
            return {'error': 'Dokter tidak ditemukan'}
        
        # Cek akses
        if current_user.role != 'admin' and doctor.user_id != current_user.id:
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
