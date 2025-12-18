from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date, Time, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from . import Base
import enum

class AppointmentStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Appointment(Base):
    """Appointment model - booking between Patient and Doctor"""
    __tablename__ = 'appointments'
    
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    doctor_id = Column(Integer, ForeignKey('doctors.id', ondelete='CASCADE'), nullable=False)
    
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    
    status = Column(String(20), nullable=False, default='pending')  # pending, confirmed, completed, cancelled
    reason = Column(Text, nullable=True)  # Reason for visit
    notes = Column(Text, nullable=True)  # Additional notes
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], back_populates="patient_appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    medical_record = relationship("MedicalRecord", back_populates="appointment", uselist=False, cascade="all, delete-orphan")
    
    def to_dict(self, include_details=True):
        """Convert appointment to dictionary representation"""
        data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'appointment_time': self.appointment_time.strftime('%H:%M') if self.appointment_time else None,
            'status': self.status,
            'reason': self.reason,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_details:
            # Include patient details
            if self.patient:
                data['patient'] = {
                    'id': self.patient.id,
                    'name': self.patient.name,
                    'email': self.patient.email,
                    'role': self.patient.role.lower() if self.patient.role else 'patient'
                }
            
            # Include doctor details with user info
            if self.doctor:
                doctor_dict = {
                    'id': self.doctor.id,
                    'name': self.doctor.user.name if self.doctor.user else 'Unknown',
                    'specialization': self.doctor.specialization,
                    'photoUrl': self.doctor.photo_url if hasattr(self.doctor, 'photo_url') else None,
                    'rating': self.doctor.rating if hasattr(self.doctor, 'rating') else 0,
                    'location': self.doctor.location if hasattr(self.doctor, 'location') else '',
                    'clinic': self.doctor.clinic if hasattr(self.doctor, 'clinic') else ''
                }
                data['doctor'] = doctor_dict
            
            if self.medical_record:
                data['has_medical_record'] = True
        
        return data
    
    def can_be_modified(self) -> bool:
        """Check if appointment can be modified (not completed or cancelled)"""
        return self.status in ['pending', 'confirmed']
    
    def __repr__(self):
        return f"<Appointment(id={self.id}, patient_id={self.patient_id}, doctor_id={self.doctor_id}, status='{self.status}')>"
