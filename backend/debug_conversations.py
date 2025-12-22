#!/usr/bin/env python
"""Debug script to check conversations for user 16"""

import os
import sys
from sqlalchemy import create_engine, and_, or_, desc
from sqlalchemy.orm import sessionmaker
from app.models import User, Message, Doctor, Appointment

# Use Neon PostgreSQL (from development.ini)
DATABASE_URL = 'postgresql+psycopg://neondb_owner:npg_UTPw63cQrWFd@ep-billowing-resonance-a1xc0z9x-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

# Create engine
engine = create_engine(DATABASE_URL, echo=False)
Session = sessionmaker(bind=engine)
session = Session()

try:
    user_id = 16
    print(f"\n=== DEBUG: Conversations for User {user_id} ===\n")
    
    # Get user
    user = session.query(User).get(user_id)
    if not user:
        print(f"User {user_id} not found!")
        sys.exit(1)
    
    print(f"User: {user.name} (ID: {user.id}, Role: {user.role})")
    
    # Get all messages with this user
    all_messages = session.query(Message).filter(
        or_(
            Message.sender_id == user_id,
            Message.recipient_id == user_id
        )
    ).order_by(desc(Message.created_at)).all()
    
    print(f"\nTotal messages: {len(all_messages)}")
    
    if all_messages:
        print("\nMessage partners:")
        partners_ids = set()
        for msg in all_messages:
            if msg.sender_id == user_id:
                partners_ids.add(msg.recipient_id)
            else:
                partners_ids.add(msg.sender_id)
        
        print(f"Unique partners: {partners_ids}")
        
        for partner_id in sorted(partners_ids):
            partner = session.query(User).get(partner_id)
            partner_msgs = session.query(Message).filter(
                or_(
                    and_(Message.sender_id == user_id, Message.recipient_id == partner_id),
                    and_(Message.sender_id == partner_id, Message.recipient_id == user_id)
                )
            ).order_by(desc(Message.created_at)).all()
            
            last_msg = partner_msgs[0] if partner_msgs else None
            print(f"\n  Partner: {partner.name} (ID: {partner_id}, Role: {partner.role})")
            print(f"    Messages: {len(partner_msgs)}")
            if last_msg:
                print(f"    Last message: {last_msg.content[:50]}... at {last_msg.created_at}")
    
    # Now check if endpoint would find them
    print(f"\n=== What endpoint would find ===\n")
    
    if user.role.lower() == 'patient':
        # Get appointment doctors
        appointment_doctor_ids = session.query(Appointment.doctor_id)\
            .filter(Appointment.patient_id == user_id)\
            .distinct().all()
        appointment_doctor_ids = [did[0] for did in appointment_doctor_ids]
        print(f"Appointment doctors: {appointment_doctor_ids}")
        
        # Get user IDs of those doctors
        appointment_doctor_user_ids = session.query(Doctor.user_id)\
            .filter(Doctor.id.in_(appointment_doctor_ids))\
            .all()
        appointment_doctor_user_ids = [uid[0] for uid in appointment_doctor_user_ids]
        print(f"Appointment doctor user IDs: {appointment_doctor_user_ids}")
        
        # Get all doctor users
        all_doctor_user_ids = session.query(Doctor.user_id).all()
        all_doctor_user_ids = [uid[0] for uid in all_doctor_user_ids]
        print(f"All doctor user IDs: {all_doctor_user_ids}")
        
        # Combine
        partner_ids = list(set(appointment_doctor_user_ids + all_doctor_user_ids))
        print(f"\nCombined partner_ids (before message filter): {partner_ids}")
        
        # Get User details for these partners
        partners = session.query(User).filter(User.id.in_(partner_ids)).all()
        print(f"Partners found: {len(partners)}")
        
        for partner in partners:
            has_messages = session.query(Message).filter(
                or_(
                    and_(Message.sender_id == user_id, Message.recipient_id == partner.id),
                    and_(Message.sender_id == partner.id, Message.recipient_id == user_id)
                )
            ).first()
            
            status = "HAS MESSAGES" if has_messages else "NO MESSAGES"
            print(f"  {partner.id} ({partner.name}): {status}")

finally:
    session.close()
    print("\n=== Done ===\n")
