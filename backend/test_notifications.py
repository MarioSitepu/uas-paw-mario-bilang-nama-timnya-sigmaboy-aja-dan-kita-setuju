#!/usr/bin/env python
"""
Test script to verify notification system is working
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.models import User, Doctor, Appointment, Notification
from app.views.auth import get_db_session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import configparser
from datetime import datetime, date, time

# Load database config
config = configparser.ConfigParser()
config.read('production.ini')  # or 'development.ini'
sqlalchemy_url = config.get('app:main', 'sqlalchemy.url')

print(f"📊 Testing Notification System")
print(f"Database URL: {sqlalchemy_url}")

# Create engine and session
engine = create_engine(sqlalchemy_url)
Session = sessionmaker(bind=engine)
session = Session()

try:
    # Check if there are any users
    users = session.query(User).all()
    print(f"\n👥 Total users in database: {len(users)}")
    for user in users[:5]:
        print(f"   - {user.name} ({user.role})")
    
    # Check doctors
    doctors = session.query(Doctor).all()
    print(f"\n🏥 Total doctors: {len(doctors)}")
    
    # Check appointments
    appointments = session.query(Appointment).all()
    print(f"\n📅 Total appointments: {len(appointments)}")
    for apt in appointments[:5]:
        patient = session.query(User).get(apt.patient_id)
        doctor = session.query(Doctor).get(apt.doctor_id)
        print(f"   - Patient: {patient.name if patient else 'Unknown'}, Doctor: {doctor.user.name if doctor and doctor.user else 'Unknown'}, Status: {apt.status}")
    
    # Check notifications
    notifications = session.query(Notification).all()
    print(f"\n🔔 Total notifications: {len(notifications)}")
    for notif in notifications[:10]:
        user = session.query(User).get(notif.user_id)
        print(f"   - User: {user.name if user else f'User {notif.user_id}'}, Title: {notif.title}, Read: {notif.is_read}")
    
    # Test creating a notification
    print(f"\n✅ Testing notification creation...")
    
    # Find a patient and doctor
    patient = session.query(User).filter(User.role == 'patient').first()
    doctor = session.query(Doctor).first()
    
    if patient and doctor:
        print(f"   Patient: {patient.name}")
        print(f"   Doctor: {doctor.user.name}")
        
        # Create test appointment
        test_apt = Appointment(
            patient_id=patient.id,
            doctor_id=doctor.id,
            appointment_date=date(2024, 12, 25),
            appointment_time=time(10, 0),
            status='pending',
            reason='Test appointment'
        )
        session.add(test_apt)
        session.flush()
        
        print(f"   Created test appointment: {test_apt.id}")
        
        # Create test notification
        test_notif = Notification(
            user_id=doctor.user.id,
            title="Test Notification",
            message=f"Patient {patient.name} has booked a new appointment",
            appointment_id=test_apt.id
        )
        session.add(test_notif)
        session.commit()
        
        print(f"   ✅ Test notification created: {test_notif.id}")
        print(f"   Notification user_id: {test_notif.user_id}")
        print(f"   Notification is_read: {test_notif.is_read}")
        
        # Verify it can be retrieved
        retrieved = session.query(Notification).get(test_notif.id)
        if retrieved:
            print(f"   ✅ Notification retrieved successfully: {retrieved.title}")
        else:
            print(f"   ❌ Failed to retrieve notification!")
            
        # Rollback test data
        session.rollback()
        print(f"   Rolled back test data")
    else:
        print(f"   ⚠️ Cannot create test - missing patient or doctor")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
finally:
    session.close()

print(f"\n✅ Test complete!")
