from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound, HTTPForbidden
from ..models import MedicalRecord, Appointment, Doctor, User
from .auth import get_db_session, require_auth


@view_config(route_name='api_medical_records', request_method='GET', renderer='json')
def get_medical_records(request):
    """Mendapatkan daftar medical records berdasarkan role user"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        
        # Normalize role to lowercase for comparison
        user_role = current_user.role.lower() if current_user.role else ''
        
        if user_role == 'patient':
            # Pasien melihat medical records miliknya
            records = session.query(MedicalRecord).join(
                Appointment, MedicalRecord.appointment_id == Appointment.id
            ).filter(Appointment.patient_id == current_user.id).all()
        elif user_role == 'doctor':
            # Dokter melihat medical records yang dia buat
            doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            if not doctor:
                return {'medical_records': [], 'total': 0}
            records = session.query(MedicalRecord).join(
                Appointment, MedicalRecord.appointment_id == Appointment.id
            ).filter(Appointment.doctor_id == doctor.id).all()
        else:
            # Admin melihat semua
            records = session.query(MedicalRecord).all()
        
        return {
            'medical_records': [rec.to_dict(include_appointment=True) for rec in records],
            'total': len(records)
        }
    finally:
        session.close()


@view_config(route_name='api_medical_records', request_method='POST', renderer='json')
def create_medical_record(request):
    """Membuat medical record baru - hanya untuk dokter setelah appointment"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        
        # Normalize role to lowercase for comparison
        user_role = current_user.role.lower() if current_user.role else ''
        if user_role != 'doctor':
            request.response.status_int = 403
            return {'error': 'Hanya dokter yang dapat membuat medical record'}
        
        data = request.json_body
        
        # Validasi field yang diperlukan
        if not data.get('appointment_id'):
            request.response.status_int = 400
            return {'error': 'appointment_id harus diisi'}
        if not data.get('diagnosis'):
            request.response.status_int = 400
            return {'error': 'diagnosis harus diisi'}
        
        # Cek apakah appointment ada dan milik dokter ini
        appointment = session.query(Appointment).filter(
            Appointment.id == data['appointment_id']
        ).first()
        
        if not appointment:
            request.response.status_int = 404
            return {'error': 'Appointment tidak ditemukan'}
        
        doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or appointment.doctor_id != doctor.id:
            request.response.status_int = 403
            return {'error': 'Anda tidak memiliki akses ke appointment ini'}
        
        # Cek apakah appointment bisa dibuat record (harus confirmed atau completed)
        if appointment.status not in ['confirmed', 'completed']:
            request.response.status_int = 400
            return {'error': 'Medical record hanya dapat dibuat untuk appointment yang sudah confirmed atau completed'}
        
        # Cek apakah sudah ada medical record untuk appointment ini
        existing = session.query(MedicalRecord).filter(
            MedicalRecord.appointment_id == data['appointment_id']
        ).first()
        
        if existing:
            request.response.status_int = 400
            return {'error': 'Medical record untuk appointment ini sudah ada'}
        
        # Buat medical record baru
        medical_record = MedicalRecord(
            appointment_id=data['appointment_id'],
            diagnosis=data['diagnosis'],
            symptoms=data.get('symptoms'),
            treatment=data.get('treatment'),
            prescription=data.get('prescription'),
            notes=data.get('notes')
        )
        
        # Update status appointment menjadi completed (jika belum)
        if appointment.status != 'completed':
            appointment.status = 'completed'
        
        session.add(medical_record)
        session.commit()
        
        return {
            'message': 'Medical record berhasil dibuat',
            'medical_record': medical_record.to_dict(include_appointment=True)
        }
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()


@view_config(route_name='api_medical_record', request_method='GET', renderer='json')
def get_medical_record(request):
    """Mendapatkan detail medical record berdasarkan ID"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        record_id = int(request.matchdict['id'])
        
        record = session.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
        
        if not record:
            return {'error': 'Medical record tidak ditemukan'}
        
        # Cek akses
        appointment = record.appointment
        if current_user.role == 'patient' and appointment.patient_id != current_user.id:
            return {'error': 'Anda tidak memiliki akses ke medical record ini'}
        elif current_user.role == 'doctor':
            doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            if not doctor or appointment.doctor_id != doctor.id:
                return {'error': 'Anda tidak memiliki akses ke medical record ini'}
        
        return {'medical_record': record.to_dict(include_appointment=True)}
    finally:
        session.close()


@view_config(route_name='api_medical_record', request_method='PUT', renderer='json')
def update_medical_record(request):
    """Update medical record - hanya dokter yang membuatnya"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        record_id = int(request.matchdict['id'])
        
        if current_user.role != 'doctor':
            request.response.status_int = 403
            return {'error': 'Hanya dokter yang dapat mengubah medical record'}
        
        record = session.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
        
        if not record:
            request.response.status_int = 404
            return {'error': 'Medical record tidak ditemukan'}
        
        # Cek akses - hanya dokter yang menangani appointment ini
        doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or record.appointment.doctor_id != doctor.id:
            request.response.status_int = 403
            return {'error': 'Anda tidak memiliki akses untuk mengubah medical record ini'}
        
        data = request.json_body
        
        # Update fields
        if 'diagnosis' in data:
            record.diagnosis = data['diagnosis']
        if 'symptoms' in data:
            record.symptoms = data['symptoms']
        if 'treatment' in data:
            record.treatment = data['treatment']
        if 'prescription' in data:
            record.prescription = data['prescription']
        if 'notes' in data:
            record.notes = data['notes']
        
        session.commit()
        
        return {
            'message': 'Medical record berhasil diperbarui',
            'medical_record': record.to_dict(include_appointment=True)
        }
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()


@view_config(route_name='api_appointment_record', request_method='GET', renderer='json')
def get_appointment_medical_record(request):
    """Mendapatkan medical record berdasarkan appointment ID"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        appointment_id = int(request.matchdict['appointment_id'])
        
        appointment = session.query(Appointment).filter(Appointment.id == appointment_id).first()
        
        if not appointment:
            request.response.status_int = 404
            return {'error': 'Appointment tidak ditemukan'}
        
        # Cek akses
        if current_user.role == 'patient' and appointment.patient_id != current_user.id:
            request.response.status_int = 403
            return {'error': 'Anda tidak memiliki akses ke appointment ini'}
        elif current_user.role == 'doctor':
            doctor = session.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            if not doctor or appointment.doctor_id != doctor.id:
                request.response.status_int = 403
                return {'error': 'Anda tidak memiliki akses ke appointment ini'}
        
        record = session.query(MedicalRecord).filter(
            MedicalRecord.appointment_id == appointment_id
        ).first()
        
        if not record:
            return {'medical_record': None, 'message': 'Medical record belum dibuat'}
        
        return {'medical_record': record.to_dict()}
    finally:
        session.close()


@view_config(route_name='api_patient_records', request_method='GET', renderer='json')
def get_patient_medical_records(request):
    """Mendapatkan semua medical records untuk pasien tertentu - hanya dokter"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        patient_id = int(request.matchdict['patient_id'])
        
        if current_user.role not in ['doctor', 'admin']:
            request.response.status_int = 403
            return {'error': 'Hanya dokter atau admin yang dapat mengakses endpoint ini'}
        
        # Cek apakah pasien ada
        patient = session.query(User).filter(User.id == patient_id, User.role == 'patient').first()
        if not patient:
            request.response.status_int = 404
            return {'error': 'Pasien tidak ditemukan'}
        
        records = session.query(MedicalRecord).join(
            Appointment, MedicalRecord.appointment_id == Appointment.id
        ).filter(Appointment.patient_id == patient_id).all()
        
        return {
            'patient': {'id': patient.id, 'name': patient.name, 'email': patient.email},
            'medical_records': [rec.to_dict(include_appointment=True) for rec in records],
            'total': len(records)
        }
    finally:
        session.close()
