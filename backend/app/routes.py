from pyramid.config import Configurator

def includeme(config):
    """Configure routes for the application"""
    
    # ==================== HOME ====================
    config.add_route('home', '/')
    
    # ==================== AUTH ROUTES ====================
    config.add_route('auth_register', '/api/auth/register')
    config.add_route('auth_login', '/api/auth/login')
    config.add_route('auth_logout', '/api/auth/logout')
    config.add_route('auth_me', '/api/auth/me')
    
    # ==================== USERS ROUTES ====================
    config.add_route('api_users', '/api/users')
    config.add_route('api_user', '/api/users/{id}')
    
    # ==================== DOCTORS ROUTES ====================
    config.add_route('api_doctors', '/api/doctors')
    config.add_route('api_doctor', '/api/doctors/{id}')
    config.add_route('api_doctor_schedule', '/api/doctors/{id}/schedule')
    config.add_route('api_specializations', '/api/specializations')
    
    # ==================== APPOINTMENTS ROUTES ====================
    config.add_route('api_appointments', '/api/appointments')
    config.add_route('api_appointment', '/api/appointments/{id}')
    config.add_route('api_appointments_today', '/api/appointments/today')
    config.add_route('api_patient_history', '/api/appointments/history')
    
    # ==================== MEDICAL RECORDS ROUTES ====================
    config.add_route('api_medical_records', '/api/medical-records')
    config.add_route('api_medical_record', '/api/medical-records/{id}')
    config.add_route('api_appointment_record', '/api/appointments/{appointment_id}/record')
    config.add_route('api_patient_records', '/api/patients/{patient_id}/records')
    
    # ==================== DASHBOARD ROUTES ====================
    config.add_route('api_dashboard', '/api/dashboard')
    
    # CORS is handled via tween in __init__.py