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
        
        return {
            'doctors': [doc.to_dict(include_user=True) for doc in doctors],
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
        
        return doctor.to_dict(include_user=True)
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
            doctor.license_number = data['license_number']
        
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
        
        return {
            'doctor_id': doctor.id,
            'doctor_name': doctor.user.name if doctor.user else None,
            'specialization': doctor.specialization,
            'schedule': doctor.schedule or {}
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
        doctor.schedule = data.get('schedule', {})
        
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
