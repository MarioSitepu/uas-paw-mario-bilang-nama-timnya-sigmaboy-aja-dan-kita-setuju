from pyramid.config import Configurator

def includeme(config):
    """Configure routes for the application"""
    
    # ==================== HOME ====================
    config.add_route('health_check', '/health')
    config.add_route('test_post', '/api/test-post')
    config.add_route('home', '/')
    
    # ==================== AUTH ROUTES ====================
    config.add_route('auth_register', '/api/auth/register')
    config.add_route('auth_login', '/api/auth/login')
    config.add_route('auth_google', '/api/auth/google')
    config.add_route('auth_google_complete', '/api/auth/google/complete')
    config.add_route('auth_logout', '/api/auth/logout')
    config.add_route('auth_me', '/api/auth/me')
    config.add_route('upload_profile_photo', '/api/auth/upload-photo')
    
    # ==================== PROFILE ROUTES ====================
    config.add_route('get_profile', '/api/profile')
    config.add_route('update_profile', '/api/profile')
    config.add_route('update_profile_photo', '/api/profile/photo')
    
    # ==================== USERS ROUTES ====================
    config.add_route('api_users', '/api/users')
    config.add_route('api_user', '/api/users/{id}')
    
    # ==================== DOCTORS ROUTES ====================
    config.add_route('api_doctors', '/api/doctors')
    config.add_route('api_doctor', '/api/doctors/{id}')
    config.add_route('api_doctor_schedule', '/api/doctors/{id}/schedule')
    config.add_route('api_specializations', '/api/specializations')
    config.add_route('api_doctor_slots', '/api/doctors/{id}/slots')
    
    # ==================== APPOINTMENTS ROUTES ====================
    config.add_route('api_appointments', '/api/appointments')
    config.add_route('api_appointment', '/api/appointments/{id}')
    config.add_route('api_appointments_today', '/api/appointments/today')
    config.add_route('api_patient_history', '/api/appointments/history')
    
    # ==================== NOTIFICATIONS ROUTES ====================
    config.add_route('api_notifications', '/api/notifications')
    config.add_route('api_notifications_read', '/api/notifications/read-all')
    config.add_route('api_notification_read', '/api/notifications/{id}/read')

    # ==================== CHAT ROUTES ====================
    config.add_route('api_conversations', '/api/chat/conversations')
    config.add_route('api_messages', '/api/chat/{partner_id}/messages')
    config.add_route('api_messages_send', '/api/chat/send')
    config.add_route('api_messages_unread_count', '/api/chat/unread')
    
    # ==================== MEDICAL RECORDS ROUTES ====================
    config.add_route('api_medical_records', '/api/medical-records')
    config.add_route('api_medical_record', '/api/medical-records/{id}')
    config.add_route('api_appointment_record', '/api/appointments/{appointment_id}/record')
    config.add_route('api_patient_records', '/api/patients/{patient_id}/records')
    
    # ==================== DASHBOARD ROUTES ====================
    config.add_route('api_dashboard', '/api/dashboard')
    
    # ==================== UPLOAD ROUTES ====================
    config.add_route('upload_profile_picture', '/api/upload/profile-picture')
    config.add_route('delete_profile_picture', '/api/upload/profile-picture')
    
    # CORS is handled via tween in __init__.py
    # CORS is handled via tween in __init__.py