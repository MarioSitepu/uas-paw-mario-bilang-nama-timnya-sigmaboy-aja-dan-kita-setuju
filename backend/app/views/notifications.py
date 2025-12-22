from pyramid.view import view_config
from ..models import Notification
from .auth import get_db_session, require_auth
from datetime import datetime

@view_config(route_name='api_notifications', request_method='GET', renderer='json')
def get_notifications(request):
    """Mendapatkan daftar notifikasi user"""
    import sys
    session = None
    try:
        session = get_db_session(request)
        current_user = require_auth(request)
        print(f"🔔 Fetching notifications for user {current_user.id} ({current_user.name})")
        
        notifications = session.query(Notification).filter(
            Notification.user_id == current_user.id
        ).order_by(Notification.created_at.desc()).all()
        
        unread_count = sum(1 for n in notifications if not n.is_read)
        print(f"   Found {len(notifications)} notification(s), {unread_count} unread")
        
        result = {
            'notifications': [n.to_dict() for n in notifications],
            'unread_count': unread_count
        }
        session.close()
        return result
    except Exception as e:
        import traceback
        print(f"❌ Error in get_notifications: {str(e)}")
        traceback.print_exc()
        sys.stderr.write(f"[GET_NOTIFICATIONS] ERROR: {str(e)}\n")
        sys.stderr.flush()
        try:
            if session:
                session.close()
        except:
            pass
        request.response.status_int = 500
        raise  # Re-raise so exception view can handle it with CORS headers

@view_config(route_name='api_notifications_read', request_method='POST', renderer='json')
def mark_all_as_read(request):
    """Menandai semua notifikasi user sebagai sudah dibaca"""
    import sys
    session = None
    try:
        session = get_db_session(request)
        current_user = require_auth(request)
        
        session.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        ).update({Notification.is_read: True}, synchronize_session=False)
        
        session.commit()
        result = {'message': 'Semua notifikasi telah dibaca'}
        session.close()
        return result
    except Exception as e:
        import traceback
        print(f"❌ Error in mark_all_as_read: {str(e)}")
        traceback.print_exc()
        sys.stderr.write(f"[MARK_ALL_READ] ERROR: {str(e)}\n")
        sys.stderr.flush()
        try:
            if session:
                session.rollback()
                session.close()
        except:
            pass
        request.response.status_int = 500
        raise

@view_config(route_name='api_notification_read', request_method='PUT', renderer='json')
def mark_as_read(request):
    """Menandai satu notifikasi sebagai sudah dibaca"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        notification_id = int(request.matchdict['id'])
        
        print(f"✓ Marking notification {notification_id} as read for user {current_user.id}")
        
        notification = session.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        ).first()
        
        if not notification:
            request.response.status_int = 404
            return {'error': 'Notifikasi tidak ditemukan'}
            
        notification.is_read = True
        session.commit()
        
        print(f"✅ Notification {notification_id} marked as read")
        return {'message': 'Notifikasi ditandai sebagai dibaca', 'notification': notification.to_dict()}
    except Exception as e:
        session.rollback()
        print(f"❌ Error marking notification as read: {str(e)}")
        return {'error': str(e)}
    finally:
        session.close()

@view_config(route_name='api_notification_unread', request_method='PUT', renderer='json')
def mark_as_unread(request):
    """Menandai satu notifikasi sebagai belum dibaca"""
    session = get_db_session(request)
    try:
        current_user = require_auth(request)
        notification_id = int(request.matchdict['id'])
        
        print(f"↩️ Marking notification {notification_id} as unread for user {current_user.id}")
        
        notification = session.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        ).first()
        
        if not notification:
            request.response.status_int = 404
            return {'error': 'Notifikasi tidak ditemukan'}
            
        notification.is_read = False
        session.commit()
        
        print(f"✅ Notification {notification_id} marked as unread")
        return {'message': 'Notifikasi ditandai sebagai belum dibaca', 'notification': notification.to_dict()}
    except Exception as e:
        session.rollback()
        print(f"❌ Error marking notification as unread: {str(e)}")
        return {'error': str(e)}
    finally:
        session.close()
