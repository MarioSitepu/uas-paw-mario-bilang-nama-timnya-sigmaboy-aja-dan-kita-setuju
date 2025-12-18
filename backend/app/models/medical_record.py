from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from . import Base

class MedicalRecord(Base):
    """Medical Record model - diagnosis and notes created by Doctor after appointment"""
    __tablename__ = 'medical_records'
    
    id = Column(Integer, primary_key=True)
    appointment_id = Column(Integer, ForeignKey('appointments.id', ondelete='CASCADE'), unique=True, nullable=False)
    
    diagnosis = Column(Text, nullable=False)
    symptoms = Column(Text, nullable=True)
    treatment = Column(Text, nullable=True)
    prescription = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    appointment = relationship("Appointment", back_populates="medical_record")
    
    def to_dict(self, include_appointment=False):
        """Convert medical record to dictionary representation"""
        data = {
            'id': self.id,
            'appointment_id': self.appointment_id,
            'diagnosis': self.diagnosis,
            'symptoms': self.symptoms,
            'treatment': self.treatment,
            'prescription': self.prescription,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Always include patient info if appointment exists
        if self.appointment:
            if self.appointment.patient:
                data['patient'] = {
                    'id': self.appointment.patient.id,
                    'name': self.appointment.patient.name,
                    'email': self.appointment.patient.email
                }
        
        if include_appointment and self.appointment:
            data['appointment'] = self.appointment.to_dict(include_details=True)
        
        return data
    
    def __repr__(self):
        return f"<MedicalRecord(id={self.id}, appointment_id={self.appointment_id})>"
