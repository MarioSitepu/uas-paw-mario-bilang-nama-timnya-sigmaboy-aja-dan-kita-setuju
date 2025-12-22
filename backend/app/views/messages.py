from pyramid.view import view_config
from pyramid.response import Response
from sqlalchemy.orm import joinedload, aliased
from sqlalchemy import or_, and_, desc, func
from ..models import Message, User, Appointment, Doctor, Notification, MessageHistory
import json
from datetime import datetime, timedelta, timezone

def to_utc7(dt):
    """Convert datetime to UTC+7 timezone for JSON serialization"""
    if dt is None:
        return None
    if dt.tzinfo is None:
        # Assume UTC if naive
        dt = dt.replace(tzinfo=timezone.utc)
    # Convert to UTC+7
    utc7 = timezone(timedelta(hours=7))
    return dt.astimezone(utc7).isoformat()

@view_config(route_name='api_conversations', renderer='json', request_method='GET')
def get_conversations(request):
    """Get list of users eligible for chat based on appointment history"""
    import sys
    session = None
    try:
        # Get current user
        user_id = request.user_id
        if not user_id:
            print(f"🔴 ERROR: request.user_id is {request.user_id}, auth header: {request.headers.get('Authorization', 'NONE')}")
            sys.stderr.write(f"[GET_CONVERSATIONS] Unauthorized: request.user_id is {request.user_id}\n")
            sys.stderr.flush()
            request.response.status_int = 401
            return {'error': 'Unauthorized', 'conversations': []}
        
        user_id = int(user_id)
        try:
            session = request.registry.dbmaker()
        except Exception as dbmaker_error:
            sys.stderr.write(f"[GET_CONVERSATIONS] CRITICAL: dbmaker() failed: {str(dbmaker_error)}\n")
            sys.stderr.flush()
            request.response.status_int = 500
            return {'error': 'Database connection failed', 'conversations': []}
        
        current_user = session.query(User).get(user_id)
        
        if not current_user:
            request.response.status_int = 404
            return {'error': 'User not found', 'conversations': []}

        print(f"📱 Fetching conversations for user {user_id} ({current_user.name}, role={current_user.role})")
        
        # Normalize role
        user_role = current_user.role.lower() if current_user.role else ''

        # Find eligible chat partners
        partner_ids = []
        
        if user_role == 'doctor':
            # Doctors can chat with:
            # 1. All patients who have booked this doctor (from appointments)
            # 2. All other patients (for new consultations)
            doctor = session.query(Doctor).filter(Doctor.user_id == user_id).first()
            if not doctor:
                print(f"⚠️ Warning: User {user_id} has role 'doctor' but no Doctor profile found.")
                session.close()
                return []
                
            # Get appointment patients
            appointment_patient_ids = session.query(Appointment.patient_id)\
                .filter(Appointment.doctor_id == doctor.id)\
                .distinct().all()
            appointment_patient_ids = [pid[0] for pid in appointment_patient_ids]
            
            # Get all patient users
            all_patient_ids = session.query(User.id).filter(User.role == 'patient').all()
            all_patient_ids = [uid[0] for uid in all_patient_ids]
            
            # Combine both (appointment patients first, then others)
            partner_ids = list(set(appointment_patient_ids + all_patient_ids))
            print(f"   Found {len(partner_ids)} patient(s) (appointments: {len(appointment_patient_ids)}, total: {len(all_patient_ids)})")
            
        elif user_role == 'patient':
            # Patients can chat with:
            # 1. All doctors who have appointments with this patient
            # 2. All other doctors (for new consultations)
            
            # Get appointment doctors
            appointment_doctor_ids = session.query(Appointment.doctor_id)\
                .filter(Appointment.patient_id == user_id)\
                .distinct().all()
            appointment_doctor_ids = [did[0] for did in appointment_doctor_ids]
            
            # Get user IDs of those doctors
            appointment_doctor_user_ids = session.query(Doctor.user_id)\
                .filter(Doctor.id.in_(appointment_doctor_ids))\
                .all()
            appointment_doctor_user_ids = [uid[0] for uid in appointment_doctor_user_ids]
            
            # Get all doctor users
            all_doctor_user_ids = session.query(Doctor.user_id).all()
            all_doctor_user_ids = [uid[0] for uid in all_doctor_user_ids]
            
            # Combine both
            partner_ids = list(set(appointment_doctor_user_ids + all_doctor_user_ids))
            print(f"   Found {len(partner_ids)} doctor(s) (appointments: {len(appointment_doctor_user_ids)}, total: {len(all_doctor_user_ids)})")
        else:
            # Admin or other role
            print(f"   Role '{user_role}' not supported for conversations")
            session.close()
            return []

        # Filter out empty list if no appointments
        if not partner_ids:
            print(f"   No conversation partners found")
            session.close()
            return []

        # Get User details for these partners
        partners = session.query(User).filter(User.id.in_(partner_ids)).all()
        
        # Calculate unread counts and last message for each partner
        # Only include partners who have message history
        results = []
        
        print(f"📨 Total partners found: {len(partners)}")
        for i, partner in enumerate(partners):
            print(f"   [{i+1}] Checking partner {partner.id} ({partner.name})...", end=" ")
            
            # Check if there's any message history with this partner
            has_messages = session.query(Message).filter(
                or_(
                    and_(Message.sender_id == user_id, Message.recipient_id == partner.id),
                    and_(Message.sender_id == partner.id, Message.recipient_id == user_id)
                )
            ).first()
            
            if has_messages:
                print(f"✓ Has messages")
            else:
                print(f"✗ No messages - SKIP")
            
            # Skip partners without message history
            if not has_messages:
                continue
            
            # Unread count (messages FROM partner TO me, is_read=False)
            unread = session.query(Message).filter(
                Message.sender_id == partner.id,
                Message.recipient_id == user_id,
                Message.is_read == False
            ).count()
            
            # Last message (we already know it exists from above)
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
                'lastMessageTime': to_utc7(last_msg.created_at) if last_msg else None
            })
            
        # Sort by recent activity (unread > last message time)
        results.sort(key=lambda x: x['lastMessageTime'] or '', reverse=True)
        print(f"✅ Returning {len(results)} conversation(s)")
        
        session.close()
        return results
    except Exception as e:
        import sys
        import traceback
        print(f"❌ Error in get_conversations: {str(e)}")
        traceback.print_exc()
        sys.stderr.write(f"[GET_CONVERSATIONS] ERROR: {str(e)}\n")
        sys.stderr.flush()
        try:
            if session:
                session.close()
        except:
            pass
        request.response.status_int = 500
        return {'error': str(e), 'conversations': []}

@view_config(route_name='api_messages', renderer='json', request_method='GET')
def get_messages(request):
    """Get message history with a specific user"""
    try:
        user_id = request.user_id
        if not user_id:
            request.response.status_int = 401
            return {'error': 'Unauthorized', 'messages': []}
        
        user_id = int(user_id)
        
        try:
            partner_id = int(request.matchdict['partner_id'])
        except (ValueError, KeyError):
            request.response.status_int = 400
            return {'error': 'Invalid partner_id'}
        
        try:
            session = request.registry.dbmaker()
        except Exception as dbmaker_error:
            import sys
            sys.stderr.write(f"[GET_MESSAGES] CRITICAL: dbmaker() failed: {str(dbmaker_error)}\n")
            sys.stderr.flush()
            request.response.status_int = 500
            return {'error': 'Database connection failed', 'messages': []}
        
        print(f"💬 Fetching messages between user {user_id} and partner {partner_id}")
        
        # Fetch messages
        messages = session.query(Message).filter(
            or_(
                and_(Message.sender_id == user_id, Message.recipient_id == partner_id),
                and_(Message.sender_id == partner_id, Message.recipient_id == user_id)
            )
        ).order_by(Message.created_at.asc()).all()
        
        print(f"   Found {len(messages)} message(s)")
        
        # Mark messages from partner as read
        unread_messages = session.query(Message).filter(
            Message.sender_id == partner_id,
            Message.recipient_id == user_id,
            Message.is_read == False
        ).all()
        
        for msg in unread_messages:
            msg.is_read = True
        
        if unread_messages:
            session.commit() # Commit read status updates
            print(f"   Marked {len(unread_messages)} message(s) as read")
        
        # Creating a list of dicts for response
        results = []
        for msg in messages:
            results.append({
                'id': msg.id,
                'senderId': msg.sender_id,
                'content': msg.content,
                'createdAt': to_utc7(msg.created_at),
                'isRead': msg.is_read
            })
        
        session.close()
        return results
    except Exception as e:
        import traceback
        import sys
        print(f"❌ Error in get_messages: {str(e)}")
        traceback.print_exc()
        sys.stderr.write(f"[GET_MESSAGES] ERROR: {str(e)}\n")
        sys.stderr.flush()
        try:
            session.close()
        except:
            pass
        request.response.status_int = 500
        return {'error': str(e), 'messages': []}


@view_config(route_name='api_messages_send', renderer='json', request_method='POST')
def send_message(request):
    """Send a new message"""
    try:
        user_id = request.user_id
        if not user_id:
            request.response.status_int = 401
            return {'error': 'Unauthorized'}
            
        user_id = int(user_id)
        try:
            data = request.json_body
        except:
            request.response.status_int = 400
            return {'error': 'Invalid JSON'}
            
        recipient_id = data.get('recipient_id')
        content = data.get('content')
        
        if not recipient_id or not content:
            request.response.status_int = 400
            return {'error': 'Missing recipient_id or content'}
         
        try:
            session = request.registry.dbmaker()
        except Exception as dbmaker_error:
            import sys
            sys.stderr.write(f"[SEND_MESSAGE] CRITICAL: dbmaker() failed: {str(dbmaker_error)}\n")
            sys.stderr.flush()
            request.response.status_int = 500
            return {'error': 'Database connection failed'}
        
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
        
        session.flush() # flush to get ID and created_at
        session.commit() # commit to save to database
        
        print(f"✅ Message sent: ID={new_msg.id}, sender={user_id}, recipient={recipient_id}")
        
        session.close()
        return {
            'id': new_msg.id,
            'senderId': new_msg.sender_id,
            'content': new_msg.content,
            'createdAt': to_utc7(new_msg.created_at),
            'isRead': False
        }
    except Exception as e:
        import traceback
        import sys
        print(f"❌ Error sending message: {str(e)}")
        traceback.print_exc()
        sys.stderr.write(f"[SEND_MESSAGE] ERROR: {str(e)}\n")
        sys.stderr.flush()
        try:
            session.rollback()
            session.close()
        except:
            pass
        request.response.status_int = 500
        return {'error': f'Failed to send message: {str(e)}'}


@view_config(route_name='api_messages_unread_count', renderer='json', request_method='GET')
def get_total_unread_count(request):
    """Get count of unique conversation partners with unread messages"""
    import sys
    session = None
    try:
        user_id = request.user_id
        if not user_id:
            return {'count': 0}
            
        user_id = int(user_id)
        try:
            session = request.registry.dbmaker()
        except Exception as dbmaker_error:
            sys.stderr.write(f"[GET_UNREAD_COUNT] CRITICAL: dbmaker() failed: {str(dbmaker_error)}\n")
            sys.stderr.flush()
            request.response.status_int = 500
            return {'error': 'Database connection failed', 'count': 0}
        
        # Count unique senders who have unread messages to this user
        unique_senders = session.query(Message.sender_id).filter(
            Message.recipient_id == user_id,
            Message.is_read == False
        ).distinct().count()
        
        session.close()
        return {'count': unique_senders}
    except Exception as e:
        import traceback
        print(f"❌ Error in get_total_unread_count: {str(e)}")
        traceback.print_exc()
        sys.stderr.write(f"[GET_UNREAD_COUNT] ERROR: {str(e)}\n")
        sys.stderr.flush()
        try:
            if session:
                session.close()
        except:
            pass
        request.response.status_int = 500
        return {'error': str(e), 'count': 0}
    except Exception as e:
        print(f"❌ Error getting unread count: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'count': 0}


@view_config(route_name='api_chat_user', renderer='json', request_method='GET')
def get_chat_user(request):
    """Get user details for chat - minimal permission check
    
    This endpoint is used when starting a new chat with someone who may not have
    an appointment history. It only requires the requesting user to be authenticated.
    """
    import sys
    session = None
    try:
        user_id = request.user_id
        if not user_id:
            sys.stderr.write(f"[GET_CHAT_USER] Unauthorized: request.user_id is None\n")
            sys.stderr.flush()
            request.response.status_int = 401
            return {'error': 'Unauthorized'}
        
        try:
            target_user_id = int(request.matchdict['user_id'])
        except (ValueError, KeyError):
            request.response.status_int = 400
            return {'error': 'Invalid user_id'}
        
        try:
            session = request.registry.dbmaker()
        except Exception as dbmaker_error:
            sys.stderr.write(f"[GET_CHAT_USER] CRITICAL: dbmaker() failed: {str(dbmaker_error)}\n")
            sys.stderr.flush()
            request.response.status_int = 500
            return {'error': 'Database connection failed'}
        
        target_user = session.query(User).filter(User.id == target_user_id).first()
        
        if not target_user:
            request.response.status_int = 404
            return {'error': 'User not found'}
        
        print(f"✅ Fetching chat user {target_user_id}: {target_user.name}")
        
        result = {
            'id': target_user.id,
            'name': target_user.name,
            'email': target_user.email,
            'role': target_user.role,
            'profile_photo_url': target_user.profile_photo_url
        }
        session.close()
        return result
    except Exception as e:
        import traceback
        print(f"❌ Error in get_chat_user: {str(e)}")
        traceback.print_exc()
        sys.stderr.write(f"[GET_CHAT_USER] ERROR: {str(e)}\n")
        sys.stderr.flush()
        try:
            if session:
                session.close()
        except:
            pass
        request.response.status_int = 500
        return {'error': str(e)}

