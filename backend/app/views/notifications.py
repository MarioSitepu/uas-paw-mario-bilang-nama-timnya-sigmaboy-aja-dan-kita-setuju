from pyramid.view import view_config
from ..models import Notification
from .auth import get_db_session, require_auth

@view_config(route_name='api_notifications', request_method='GET', renderer='json')
def get_notifications(request):
    """Mendapatkan daftar notifikasi user"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        
        notifications = session.query(Notification).filter(
            Notification.user_id == current_user.id
        ).order_by(Notification.created_at.desc()).all()
        
        return {
            'notifications': [n.to_dict() for n in notifications],
            'unread_count': sum(1 for n in notifications if not n.is_read)
        }
    finally:
        session.close()

@view_config(route_name='api_notifications_read', request_method='POST', renderer='json')
def mark_all_as_read(request):
    """Menandai semua notifikasi user sebagai sudah dibaca"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        
        session.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        ).update({Notification.is_read: True}, synchronize_session=False)
        
        session.commit()
        return {'message': 'Semua notifikasi telah dibaca'}
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()

@view_config(route_name='api_notification_read', request_method='PUT', renderer='json')
def mark_as_read(request):
    """Menandai satu notifikasi sebagai sudah dibaca"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        notification_id = int(request.matchdict['id'])
        
        notification = session.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        ).first()
        
        if not notification:
            request.response.status_int = 404
            return {'error': 'Notifikasi tidak ditemukan'}
            
        notification.is_read = True
        session.commit()
        
        return {'message': 'Notifikasi ditandai sebagai dibaca'}
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()
