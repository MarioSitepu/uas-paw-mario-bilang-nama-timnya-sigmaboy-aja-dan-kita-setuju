# Debugging Notifications & Messages System

This document provides comprehensive instructions for debugging the notification and messaging system.

## Overview

The notification and messaging system consists of:
- **Backend**: Pyramid REST API endpoints
- **Database**: SQLAlchemy ORM with PostgreSQL
- **Frontend**: React + TypeScript with axios API client
- **Logging**: Console logging with emoji prefixes for easy visual tracking

## System Components

### Backend Endpoints

1. **Notifications API**:
   - `GET /api/notifications` - Fetch all notifications for authenticated user
   - `PUT /api/notifications/{id}/read` - Mark notification as read
   - `PUT /api/notifications/{id}/unread` - Mark notification as unread
   - `POST /api/notifications/read-all` - Mark all notifications as read

2. **Messages API**:
   - `GET /api/chat/conversations` - Get list of chat partners
   - `GET /api/chat/{partner_id}/messages` - Get message history with partner
   - `POST /api/chat/send` - Send a new message
   - `GET /api/chat/unread` - Get total unread message count

3. **Appointment API** (creates notifications):
   - `POST /api/appointments` - Create appointment (notifies doctor)
   - `PUT /api/appointments/{id}` - Update appointment (notifies patient)
   - `DELETE /api/appointments/{id}` - Cancel appointment (notifies both)

## Data Flow Diagram

### Appointment Creation → Doctor Notification
```
1. Patient calls POST /api/appointments
2. Backend creates Appointment object
3. Backend creates Notification for doctor
4. Backend commits both to database
5. Frontend calls GET /api/notifications
6. Backend queries Notification table
7. Frontend renders notification
```

### Message Sending → Notification + Conversation
```
1. Patient calls POST /api/chat/send
2. Backend creates Message object
3. Backend creates MessageHistory object
4. Backend creates Notification for recipient
5. Backend commits all to database
6. Frontend calls GET /api/chat/{partner_id}/messages
7. Frontend displays message in chat
```

## Debugging Procedure

### Step 1: Verify Backend Logging

Check the backend server logs for these emoji-prefixed logs:

**When creating an appointment:**
```
📝 Creating appointment: id=123, doctor_id=5
   Doctor user found: id=10, name=Dr. Smith
   ✅ Notification added for doctor 10
✅ Appointment created and committed: id=123
```

**If notifications NOT created:**
```
📝 Creating appointment: id=123, doctor_id=5
⚠️  Warning: Doctor or doctor.user is None - no notification created
```

**When fetching notifications:**
```
🔔 Fetching notifications for user 10 (Dr. Smith)
   Found 5 notification(s), 3 unread
✅ Returning 5 notification(s)
```

**When sending messages:**
```
💬 Fetching messages with partner 5...
   Found 12 message(s)
   Marked 2 message(s) as read
✅ Message sent: ID=456, sender=10, recipient=5
```

### Step 2: Monitor Frontend Browser Console

Open browser Developer Tools (F12) → Console tab to see:

```
🔔 Fetching notifications from API...
📥 API Response: {data: {…}}
   Notifications: [Array(3)]
   Unread count: 2
✅ Notifications loaded successfully

💬 Fetching conversations...
📥 Conversations response: [Array(2)]
✅ Loaded 2 conversation(s)

💬 Fetching messages with partner 5...
📥 Messages response: [Array(12)]
✅ Loaded 12 message(s)
```

### Step 3: Verify API Responses with curl/Postman

#### Get Notifications
```bash
curl -X GET http://localhost:6543/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "notifications": [
    {
      "id": 1,
      "title": "New Appointment Booking",
      "message": "Patient John has booked a new appointment...",
      "appointment_id": 5,
      "is_read": false,
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "unread_count": 1
}
```

#### Get Conversations
```bash
curl -X GET http://localhost:6543/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
[
  {
    "id": 5,
    "name": "Dr. Smith",
    "role": "doctor",
    "photoUrl": "https://...",
    "unreadCount": 2,
    "lastMessage": "See you soon",
    "lastMessageTime": "2024-01-15T10:30:00"
  }
]
```

#### Get Messages
```bash
curl -X GET http://localhost:6543/api/chat/5/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
[
  {
    "id": 1,
    "senderId": 10,
    "content": "Hello, I have a concern",
    "createdAt": "2024-01-15T10:30:00",
    "isRead": true
  }
]
```

### Step 4: Check Database Directly

If using PostgreSQL:

```sql
-- Check notifications table exists
SELECT * FROM information_schema.tables WHERE table_name='notifications';

-- Count notifications
SELECT COUNT(*) FROM notifications;

-- View notifications for a specific user
SELECT id, title, message, is_read, created_at 
FROM notifications 
WHERE user_id = 10 
ORDER BY created_at DESC;

-- Check if message_history table exists
SELECT * FROM information_schema.tables WHERE table_name='message_history';

-- View recent messages
SELECT id, sender_id, recipient_id, content, created_at 
FROM messages 
ORDER BY created_at DESC 
LIMIT 10;
```

## Common Issues & Solutions

### Issue: No Notifications Appear

**Possible Causes:**

1. **Database migrations not applied**
   - Solution: Run `alembic upgrade head` in backend folder
   - Verify with: `SELECT * FROM information_schema.tables WHERE table_name IN ('notifications', 'notification_history')`

2. **Notifications created but not committed**
   - Look for logs without "✅ Notification added" and "✅ ...committed"
   - Check that `session.commit()` is called after adding notifications

3. **Doctor user not found**
   - Error log: "⚠️ Warning: Doctor or doctor.user is None"
   - Verify doctor record exists: `SELECT * FROM doctors WHERE id = X`
   - Verify user record exists: `SELECT * FROM users WHERE id = (SELECT user_id FROM doctors WHERE id = X)`

4. **Frontend not calling API**
   - Check browser console for fetch errors
   - Verify Authorization header is being sent
   - Check CORS headers in browser Network tab

5. **API authentication failing**
   - Error response: `{"error": "Unauthorized"}`
   - Verify token is stored in localStorage
   - Check token is valid: decode JWT and check expiration

### Issue: Messages Not Appearing

**Possible Causes:**

1. **Conversation partners not found**
   - Log: "No conversation partners found"
   - Verify appointments exist: `SELECT COUNT(*) FROM appointments WHERE patient_id = X`
   - Verify doctor has user: `SELECT * FROM doctors WHERE id = Y`

2. **Messages not being saved**
   - Missing `session.commit()` in `send_message()`
   - Check database for messages: `SELECT * FROM messages WHERE sender_id = X OR recipient_id = X`

3. **Wrong partner_id format**
   - Ensure partner_id is an integer, not string
   - Frontend passes partnerId as number, backend receives as int

4. **Polling interval too long**
   - Chat polls every 3 seconds, notifications every 10 seconds
   - For testing, reduce intervals temporarily

## Testing Reproduction Steps

### Manual Test: Create Appointment & Check Notification

1. **Login as patient**
   - Open browser console (F12)
   - Login to application
   - Observe auth token in localStorage

2. **Create appointment**
   - Go to "Find Doctors" page
   - Click "Book Appointment"
   - Fill form and submit
   - Watch server logs for "📝 Creating appointment..."

3. **Check notification was created**
   - Server logs should show "✅ Notification added for doctor..."
   - Check database: `SELECT * FROM notifications WHERE title='New Appointment Booking' ORDER BY created_at DESC LIMIT 1`

4. **Verify frontend shows notification**
   - Logout patient
   - Login as doctor
   - Go to Notifications page
   - Watch browser console for "✅ Notifications loaded successfully"
   - Verify notification appears in UI

5. **Confirm as doctor**
   - Click notification
   - Confirm appointment
   - Watch server logs for "📝 Updating appointment...status to confirmed"
   - Patient should receive "Appointment Confirmed" notification

### Manual Test: Send Message & Check Display

1. **Login as patient**
   - Create appointment with doctor (from above steps)

2. **Send message**
   - Go to "Find Doctors" page
   - Click message button on doctor card
   - Type and send message
   - Watch server logs for "✅ Message sent: ID=..."

3. **Check message in database**
   - `SELECT * FROM messages ORDER BY created_at DESC LIMIT 1`
   - Verify sender_id and recipient_id

4. **Verify frontend displays message**
   - Message should appear in chat immediately
   - Browser console should show "✅ Loaded X message(s)"

5. **Login as doctor and check**
   - Logout patient
   - Login as doctor
   - Go to Chat page
   - Patient should appear in conversation list
   - Message should appear in chat
   - Notification should appear for new message

## Performance Notes

- Notifications are polled every 10 seconds
- Messages are polled every 3 seconds when chat is open
- For real-time updates, consider WebSocket implementation
- Current polling is suitable for non-critical notifications

## Related Files

- Backend notifications: `backend/app/views/notifications.py`
- Backend messages: `backend/app/views/messages.py`
- Backend appointments: `backend/app/views/appointments.py`
- Frontend notifications: `frontend/src/pages/NotificationsPage.tsx`
- Frontend chat: `frontend/src/pages/ChatPage.tsx`
- Frontend API: `frontend/src/services/api.ts`
- Models: `backend/app/models/` (notification.py, message.py, doctor.py, user.py, appointment.py)
- Routes: `backend/app/routes.py`
- Migrations: `backend/alembic/versions/` (especially 004_add_history_tables.py, 79d021df2315_add_notifications_table.py)

## Enabling More Verbose Logging

To add even more logging, edit the view files and add:

```python
# At the start of a function
print(f"🔧 DEBUG: Function called with request.json_body={request.json_body}")

# When checking conditions
print(f"   Condition check: is_doctor={is_doctor}, has_doctor_user={doctor and doctor.user}")

# After database queries
print(f"   Query result: found {len(results)} records")
```

Then monitor server logs with:
```bash
# For local development
tail -f server.log

# For Render/deployed environment
# Check Render.com dashboard → Logs section
```
