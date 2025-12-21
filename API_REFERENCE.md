# API Reference: Notifications & Messages

Complete reference for all notification and messaging API endpoints with request/response examples.

## Authentication

All endpoints require Bearer token authentication in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

The token is obtained from login and stored in `localStorage['auth_token']`.

## Notifications API

### GET /api/notifications
Retrieve all notifications for the authenticated user.

**Request:**
```bash
GET /api/notifications
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "id": 1,
      "title": "New Appointment Booking",
      "message": "Patient John Doe has booked a new appointment for 2024-01-20 at 14:00.",
      "appointment_id": 5,
      "is_read": false,
      "created_at": "2024-01-15T10:30:45.123456"
    },
    {
      "id": 2,
      "title": "Appointment Confirmed",
      "message": "Dr. Smith has confirmed your appointment for 2024-01-20 at 14:00.",
      "appointment_id": 5,
      "is_read": true,
      "created_at": "2024-01-15T11:45:30.654321"
    }
  ],
  "unread_count": 1
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

### PUT /api/notifications/{id}/read
Mark a single notification as read.

**Request:**
```bash
PUT /api/notifications/1/read
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "message": "Notifikasi ditandai sebagai dibaca",
  "notification": {
    "id": 1,
    "title": "New Appointment Booking",
    "message": "Patient John Doe has booked a new appointment...",
    "appointment_id": 5,
    "is_read": true,
    "created_at": "2024-01-15T10:30:45"
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Notifikasi tidak ditemukan"
}
```

---

### PUT /api/notifications/{id}/unread
Mark a single notification as unread.

**Request:**
```bash
PUT /api/notifications/1/unread
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "message": "Notifikasi ditandai sebagai belum dibaca",
  "notification": {
    "id": 1,
    "title": "New Appointment Booking",
    "message": "Patient John Doe has booked a new appointment...",
    "appointment_id": 5,
    "is_read": false,
    "created_at": "2024-01-15T10:30:45"
  }
}
```

---

### POST /api/notifications/read-all
Mark all notifications as read for the authenticated user.

**Request:**
```bash
POST /api/notifications/read-all
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "message": "Semua notifikasi telah dibaca"
}
```

---

## Messages API

### GET /api/chat/conversations
Get list of eligible chat partners based on appointment history.

**Request:**
```bash
GET /api/chat/conversations
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 10,
    "name": "Dr. Smith",
    "role": "doctor",
    "photoUrl": "https://api.example.com/photos/10.jpg",
    "unreadCount": 2,
    "lastMessage": "See you on Monday!",
    "lastMessageTime": "2024-01-15T14:30:00"
  },
  {
    "id": 11,
    "name": "Dr. Johnson",
    "role": "doctor",
    "photoUrl": "https://api.example.com/photos/11.jpg",
    "unreadCount": 0,
    "lastMessage": "Thank you for coming",
    "lastMessageTime": "2024-01-14T16:00:00"
  }
]
```

**Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

### GET /api/chat/{partner_id}/messages
Get message history with a specific user. Messages from the partner are automatically marked as read.

**Request:**
```bash
GET /api/chat/10/messages
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "senderId": 5,
    "content": "Hello, I'd like to book an appointment",
    "createdAt": "2024-01-15T10:00:00",
    "isRead": true
  },
  {
    "id": 2,
    "senderId": 10,
    "content": "Sure, I have an opening on Monday at 2 PM",
    "createdAt": "2024-01-15T10:15:00",
    "isRead": true
  },
  {
    "id": 3,
    "senderId": 5,
    "content": "Perfect! See you then",
    "createdAt": "2024-01-15T10:30:00",
    "isRead": false
  }
]
```

**Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

### POST /api/chat/send
Send a new message to a user.

**Request:**
```bash
POST /api/chat/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient_id": 10,
  "content": "Hello, I have a question about my appointment"
}
```

**Response (200 OK):**
```json
{
  "id": 4,
  "senderId": 5,
  "content": "Hello, I have a question about my appointment",
  "createdAt": "2024-01-15T14:45:30",
  "isRead": false
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Missing recipient_id or content"
}
```

**Response (500 Server Error):**
```json
{
  "error": "Failed to send message: [error details]"
}
```

---

### GET /api/chat/unread
Get total count of unread messages for the authenticated user.

**Request:**
```bash
GET /api/chat/unread
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "count": 3
}
```

---

## Appointments API (Notification Integration)

### POST /api/appointments
Create a new appointment (Doctor receives notification).

**Request:**
```bash
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctor_id": 5,
  "appointment_date": "2024-01-20",
  "appointment_time": "14:00",
  "reason": "Regular checkup",
  "notes": "Please review my recent lab results"
}
```

**Response (200 OK):**
```json
{
  "message": "Appointment berhasil dibuat",
  "appointment": {
    "id": 10,
    "patient_id": 5,
    "doctor_id": 8,
    "appointment_date": "2024-01-20",
    "appointment_time": "14:00",
    "status": "pending",
    "reason": "Regular checkup",
    "notes": "Please review my recent lab results",
    "created_at": "2024-01-15T10:30:00"
  }
}
```

**Side Effects:**
- Notification created for doctor:
  ```json
  {
    "title": "New Appointment Booking",
    "message": "Patient John Doe has booked a new appointment for 2024-01-20 at 14:00.",
    "user_id": 8,  // doctor's user_id
    "appointment_id": 10
  }
  ```

**Response (403 Forbidden):**
```json
{
  "error": "Akses ditolak: Hanya pasien yang dapat membuat appointment. Role Anda saat ini: DOCTOR"
}
```

---

### PUT /api/appointments/{id}
Update appointment (status change notifies patient).

**Request:**
```bash
PUT /api/appointments/10
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

**Response (200 OK):**
```json
{
  "message": "Appointment berhasil diperbarui",
  "appointment": {
    "id": 10,
    "status": "confirmed",
    ...
  }
}
```

**Side Effects (when status changes):**
- If status → "confirmed": Patient receives "Appointment Confirmed" notification
- If status → "completed": Patient receives "Appointment Completed" notification  
- If status → "cancelled": Patient receives "Appointment Cancelled" notification

---

### DELETE /api/appointments/{id}
Cancel an appointment (Cancelling user notifies the other party).

**Request:**
```bash
DELETE /api/appointments/10
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Appointment berhasil dibatalkan"
}
```

**Side Effects:**
- If cancelled by patient: Doctor receives "Appointment Cancelled by Patient" notification
- If cancelled by doctor/admin: Patient receives "Appointment Cancelled" notification

---

## Response Patterns

### Success Pattern
All successful responses include relevant data wrapped in a consistent structure.

### Error Pattern
Errors are returned with appropriate HTTP status codes:

```json
{
  "error": "Description of what went wrong"
}
```

Common status codes:
- `200` - OK
- `400` - Bad Request (missing/invalid fields)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Frontend Integration Examples

### Fetching Notifications (React)
```typescript
import { notificationsAPI } from '../services/api';

const fetchNotifications = async () => {
  try {
    const response = await notificationsAPI.getAll();
    const { notifications, unread_count } = response.data;
    setNotifications(notifications);
    setUnreadCount(unread_count);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};
```

### Sending a Message (React)
```typescript
const handleSendMessage = async (recipientId: number, content: string) => {
  try {
    const response = await chatAPI.sendMessage(recipientId, content);
    const newMessage = response.data;
    setMessages(prev => [...prev, newMessage]);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};
```

### Toggling Notification Read Status (React)
```typescript
const handleToggleRead = async (notificationId: number, isCurrentlyRead: boolean) => {
  try {
    if (isCurrentlyRead) {
      await notificationsAPI.unreadOne(notificationId);
    } else {
      await notificationsAPI.readOne(notificationId);
    }
    // Update local state
  } catch (error) {
    console.error('Failed to toggle notification:', error);
  }
};
```

---

## Data Type Reference

### Notification Object
| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique notification ID |
| title | string | Notification title |
| message | string | Notification message content |
| appointment_id | number | Related appointment ID (nullable) |
| is_read | boolean | Whether notification has been read |
| created_at | string | ISO 8601 timestamp |

### Message Object
| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique message ID |
| senderId | number | User ID of sender |
| recipientId | number | User ID of recipient |
| content | string | Message text content |
| createdAt | string | ISO 8601 timestamp |
| isRead | boolean | Whether message has been read |

### Conversation Object
| Field | Type | Description |
|-------|------|-------------|
| id | number | User ID of conversation partner |
| name | string | Partner's display name |
| role | string | Partner's role (doctor/patient) |
| photoUrl | string | URL to partner's profile photo |
| unreadCount | number | Number of unread messages from partner |
| lastMessage | string | Content of most recent message |
| lastMessageTime | string | Timestamp of last message |

---

## Testing with curl

### Test Create Appointment (triggers doctor notification)
```bash
curl -X POST http://localhost:6543/api/appointments \
  -H "Authorization: Bearer $(cat token.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": 5,
    "appointment_date": "2024-01-20",
    "appointment_time": "14:00",
    "reason": "Checkup"
  }'
```

### Test Get Notifications
```bash
curl -X GET http://localhost:6543/api/notifications \
  -H "Authorization: Bearer $(cat token.txt)" \
  -H "Content-Type: application/json"
```

### Test Send Message
```bash
curl -X POST http://localhost:6543/api/chat/send \
  -H "Authorization: Bearer $(cat token.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 10,
    "content": "Hello!"
  }'
```

### Test Get Conversations
```bash
curl -X GET http://localhost:6543/api/chat/conversations \
  -H "Authorization: Bearer $(cat token.txt)" \
  -H "Content-Type: application/json"
```
