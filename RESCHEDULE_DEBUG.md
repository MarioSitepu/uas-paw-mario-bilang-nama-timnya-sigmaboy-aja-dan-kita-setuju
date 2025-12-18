# Reschedule Appointment Debug Guide

## Summary of Changes Made

### Backend (Python/Pyramid)
**File**: `backend/app/views/appointments.py`

Added comprehensive debug logging to PUT endpoint (update_appointment):
```python
- DEBUG PUT: Starting update appointment
- DEBUG PUT: Appointment ID={id}, User ID={user_id}
- DEBUG PUT: Found appointment, status={status}, patient_id={patient_id}, doctor_id={doctor_id}
- DEBUG PUT: Access check - is_patient={bool}, is_doctor={bool}, is_admin={bool}
- DEBUG PUT: Request data: {data}
- DEBUG PUT: can_be_modified()={bool}, status={status}
- DEBUG PUT: Updating appointment_date from {old} to {new}
- DEBUG PUT: Updating appointment_time from {old} to {new}
- DEBUG PUT: Successfully committed changes
```

### Frontend (React/TypeScript)
**File**: `frontend/src/pages/patient/AppointmentDetail.tsx`

Added comprehensive debug logging to handleReschedule function:
```javascript
- === RESCHEDULE APPOINTMENT START ===
- 📅 Rescheduling appointment ID: {id}
- 📅 New date: {date}
- ⏰ New time: {time}
- 📤 Sending PUT request to: {url}
- 📤 Payload: {appointment_date, appointment_time}
- ✅ Reschedule successful!
- ✅ Response: {response}
- 🔄 NOW redirecting to /app/patient/appointments
- === RESCHEDULE APPOINTMENT COMPLETE ===
```

OR error logs:
```javascript
- === RESCHEDULE APPOINTMENT ERROR ===
- ❌ Full error object: {error}
- ❌ Error message: {message}
- ❌ Error status: {status}
- ❌ Error data: {response_data}
```

## Testing Steps

### 1. Login and Create a Test Appointment
1. Navigate to `http://127.0.0.1:5173` (or your frontend dev URL)
2. Login as a patient
3. Go to "Book Appointment"
4. Select a doctor and book an appointment
5. Confirm the appointment was created (should appear in "My Appointments")

### 2. Test Reschedule
1. Go to "My Appointments"
2. Click on an appointment with status "pending" or "confirmed"
3. Click the "Reschedule" button
4. A modal should open with:
   - Date picker (showing current appointment date)
   - Time slot picker (showing available times)
5. Select a new date
6. Select a new time
7. Click "Reschedule" button
8. **IMPORTANT**: Open browser DevTools (F12) → Console tab

### 3. Check Frontend Logs
In the browser console, you should see logs starting with:
```
=== RESCHEDULE APPOINTMENT START ===
📅 Rescheduling appointment ID: {id}
📅 New date: {date}
⏰ New time: {time}
📤 Sending PUT request to: /api/appointments/{id}
📤 Payload: {appointment_date: "YYYY-MM-DD", appointment_time: "HH:MM"}
```

If you see an error log:
```
=== RESCHEDULE APPOINTMENT ERROR ===
❌ Error status: {status}
❌ Error data: {data}
```

This tells you what went wrong.

### 4. Check Backend Logs
In the backend terminal where `pserve` is running, you should see:
```
DEBUG PUT: Starting update appointment
DEBUG PUT: Appointment ID=..., User ID=...
DEBUG PUT: Found appointment, status=pending, patient_id=...
DEBUG PUT: Access check - is_patient=True, is_doctor=False, is_admin=False
DEBUG PUT: Request data: {...}
DEBUG PUT: can_be_modified()=True, status=pending
DEBUG PUT: Updating appointment_date from ... to ...
DEBUG PUT: Updating appointment_time from ... to ...
DEBUG PUT: Successfully committed changes
```

## Common Issues & Solutions

### Issue 1: Modal doesn't appear
**Frontend Console**: No logs at all when clicking "Reschedule"
**Solution**: Check if `showRescheduleModal` is being set to `true`

### Issue 2: Date/Time pickers don't show
**Frontend Console**: Logs show rescheduleDate is empty
**Solution**: Make sure DatePicker is updating `rescheduleDate` state

### Issue 3: Reschedule button is disabled
**Frontend UI**: Reschedule button is grayed out
**Reason**: Either date or time hasn't been selected
**Solution**: Select both date AND time

### Issue 4: Frontend shows error "Missing required fields"
**Frontend Console**: Shows `Missing required fields: {appointment: true, rescheduleDate: false, rescheduleTime: false}`
**Solution**: Make sure you selected both date and time

### Issue 5: Backend returns 401 Unauthorized
**Backend Console**: Access check shows `is_patient=False`
**Frontend Console Error**: `Error status: 401`
**Reason**: Token not being sent or user not authenticated
**Solution**: Make sure you're logged in and token is in localStorage

### Issue 6: Backend returns 403 Forbidden
**Backend Console**: "Anda tidak memiliki akses untuk mengubah appointment ini"
**Reason**: Patient is trying to reschedule someone else's appointment
**Solution**: Make sure you're logged in as the patient who owns the appointment

### Issue 7: Backend returns validation error
**Backend Console**: Shows error updating date/time format
**Frontend Console**: `Error data: {error: "Format tanggal tidak valid"}` or `"Format waktu tidak valid"`
**Reason**: Date/time format is wrong
**Expected Format**: 
- Date: `YYYY-MM-DD` (e.g., "2025-12-25")
- Time: `HH:MM` (e.g., "14:30")
**Solution**: Check DatePicker and TimeSlotPicker return correct format

### Issue 8: Appointment status prevents modification
**Backend Console**: Shows `can_be_modified()=False, status=cancelled`
**Frontend Console Error**: `Error data: {error: "...tidak dapat dimodifikasi..."}` 
**Reason**: Can only reschedule appointments with status "pending" or "confirmed"
**Solution**: Only reschedule pending/confirmed appointments, not completed/cancelled ones

## Next Steps if Issue Persists

1. **Take screenshots** of:
   - The appointment detail page
   - The reschedule modal when open
   - The browser console (F12) during reschedule attempt
   - The backend terminal output

2. **Share the following**:
   - Frontend console logs (copy from DevTools)
   - Backend logs (copy from terminal)
   - Error messages if any
   - Appointment ID being tested

3. **Provide information**:
   - Your user role (patient/doctor)
   - Appointment status (pending/confirmed/completed/cancelled)
   - Which date/time you selected to reschedule to

## Files Modified for Debugging

1. `backend/app/views/appointments.py` - Lines 180-248 (PUT endpoint)
2. `frontend/src/pages/patient/AppointmentDetail.tsx` - Lines 147-180 (handleReschedule function)

Both files have been updated with detailed console logs that will help identify exactly where the issue occurs.
