from pyramid.view import view_config
from pyramid.response import Response
from sqlalchemy.orm import joinedload, aliased
from sqlalchemy import or_, and_, desc, func
from ..models import Message, User, Appointment, Doctor, Notification, MessageHistory
import json
from datetime import datetime

@view_config(route_name='api_conversations', renderer='json', request_method='GET')
def get_conversations(request):
    """Get list of users eligible for chat based on appointment history"""
    # Get current user
    user_id = request.authenticated_userid
    if not user_id:
        return Response(json.dumps({'error': 'Unauthorized'}), status=401, content_type='application/json')
    
    user_id = int(user_id)
    session = request.dbsession
    current_user = session.query(User).get(user_id)
    
    if not current_user:
        return Response(json.dumps({'error': 'User not found'}), status=404, content_type='application/json')

    # Normalize role
    user_role = current_user.role.lower() if current_user.role else ''

    # Find eligible chat partners from appointments
    if user_role == 'doctor':
        # Find all patients who have booked this doctor
        # We need to find the doctor ID first (since user_id is user table id)
        doctor = session.query(Doctor).filter(Doctor.user_id == user_id).first()
        if not doctor:
            # Try to log this issue or handle it gracefully
            print(f"Warning: User {user_id} has role 'doctor' but no Doctor profile found.")
            return []
            
        # Get unique patient IDs from appointments
        # Include ALL appointments regardless of status so Pending requests can chat
        patient_ids = session.query(Appointment.patient_id)\
            .filter(Appointment.doctor_id == doctor.id)\
            .distinct().all()
        partner_ids = [pid[0] for pid in patient_ids]
        
    elif user_role == 'patient':
        # Find all doctors booked by this patient
        doctor_ids = session.query(Appointment.doctor_id)\
            .filter(Appointment.patient_id == user_id)\
            .distinct().all()
            
        # We have doctor IDs, but we need their User IDs for the Message table
        doc_ids = [did[0] for did in doctor_ids]
        if not doc_ids:
            return []
            
        # Join Doctor table to get User IDs
        user_ids = session.query(Doctor.user_id)\
            .filter(Doctor.id.in_(doc_ids))\
            .all()
        partner_ids = [uid[0] for uid in user_ids]
    else:
        # Admin or other role
        return []

    # Filter out empty list if no appointments
    if not partner_ids:
        return []

    # Get User details for these partners
    partners = session.query(User).filter(User.id.in_(partner_ids)).all()
    
    # Calculate unread counts and last message for each partner
    results = []
    
    # Pre-fetch counts could be optimized but looping is fine for small scale
    for partner in partners:
        # Unread count (messages FROM partner TO me, is_read=False)
        unread = session.query(Message).filter(
            Message.sender_id == partner.id,
            Message.recipient_id == user_id,
            Message.is_read == False
        ).count()
        
        # Last message
        last_msg = session.query(Message).filter(
            or_(
                and_(Message.sender_id == user_id, Message.recipient_id == partner.id),
                and_(Message.sender_id == partner.id, Message.recipient_id == user_id)
            )
        ).order_by(desc(Message.created_at)).first()
        
        results.append({
            'id': partner.id,
            'name': partner.name,
            'role': partner.role,
            'photoUrl': partner.profile_photo_url,
            'unreadCount': unread,
            'lastMessage': last_msg.content if last_msg else None,
            'lastMessageTime': last_msg.created_at.isoformat() if last_msg else None
        })
        
    # Sort by recent activity (unread > last message time)
    results.sort(key=lambda x: x['lastMessageTime'] or '', reverse=True)
    
    return results

@view_config(route_name='api_messages', renderer='json', request_method='GET')
def get_messages(request):
    """Get message history with a specific user"""
    user_id = request.authenticated_userid
    if not user_id:
        return Response(json.dumps({'error': 'Unauthorized'}), status=401, content_type='application/json')
    
    user_id = int(user_id)
    partner_id = request.matchdict['partner_id']
    partner_id = int(partner_id)
    session = request.dbsession
    
    # Fetch messages
    messages = session.query(Message).filter(
        or_(
            and_(Message.sender_id == user_id, Message.recipient_id == partner_id),
            and_(Message.sender_id == partner_id, Message.recipient_id == user_id)
        )
    ).order_by(Message.created_at.asc()).all()
    
    # Mark messages from partner as read
    unread_messages = session.query(Message).filter(
        Message.sender_id == partner_id,
        Message.recipient_id == user_id,
        Message.is_read == False
    ).all()
    
    for msg in unread_messages:
        msg.is_read = True
    
    session.commit() # Commit read status updates
    
    # Creating a list of dicts for response
    results = []
    for msg in messages:
        results.append({
            'id': msg.id,
            'senderId': msg.sender_id,
            'content': msg.content,
            'createdAt': msg.created_at.isoformat(),
            'isRead': msg.is_read
        })
        
    return results

@view_config(route_name='api_messages_send', renderer='json', request_method='POST')
def send_message(request):
    """Send a new message"""
    user_id = request.authenticated_userid
    if not user_id:
        return Response(json.dumps({'error': 'Unauthorized'}), status=401, content_type='application/json')
        
    user_id = int(user_id)
    try:
        data = request.json_body
    except:
        return Response(json.dumps({'error': 'Invalid JSON'}), status=400, content_type='application/json')
        
    recipient_id = data.get('recipient_id')
    content = data.get('content')
    
    if not recipient_id or not content:
         return Response(json.dumps({'error': 'Missing recipient_id or content'}), status=400, content_type='application/json')
         
    session = request.dbsession
    
    new_msg = Message(
        sender_id=user_id,
        recipient_id=recipient_id,
        content=content
    )
    
    session.add(new_msg)
    
    # Record message in message_history
    msg_history = MessageHistory(
        sender_id=user_id,
        recipient_id=recipient_id,
        content=content,
        is_read=False
    )
    session.add(msg_history)
    
    # Notify recipient
    sender = session.query(User).get(user_id)
    notification = Notification(
        user_id=recipient_id,
        title=f"Pesan Baru dari {sender.name if sender else 'User'}",
        message=content[:50] + ('...' if len(content) > 50 else ''),
        is_read=False
    )
    session.add(notification)
    
    session.flush() # flush to get ID and created_at
    session.commit() # commit to save to database
    
    return {
        'id': new_msg.id,
        'senderId': new_msg.sender_id,
        'content': new_msg.content,
        'createdAt': new_msg.created_at.isoformat(),
        'isRead': False
    }

@view_config(route_name='api_messages_unread_count', renderer='json', request_method='GET')
def get_total_unread_count(request):
    """Get total unread messages count for sidebar badge"""
    user_id = request.authenticated_userid
    if not user_id:
        return {'count': 0}
        
    user_id = int(user_id)
    session = request.dbsession
    
    count = session.query(Message).filter(
        Message.recipient_id == user_id,
        Message.is_read == False
    ).count()
    
    return {'count': count}
