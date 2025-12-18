from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from . import Base

class Doctor(Base):
    """Doctor model - extends User with specialization and schedule"""
    __tablename__ = 'doctors'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    specialization = Column(String(100), nullable=False)
    license_number = Column(String(50), unique=True, nullable=True)
    phone = Column(String(20), nullable=True)
    bio = Column(Text, nullable=True)
    
    # Schedule stored as JSON: {"monday": ["09:00-12:00", "14:00-17:00"], "tuesday": [...], ...}
    schedule = Column(JSON, nullable=True, default={})
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor", cascade="all, delete-orphan")
    
    def to_dict(self, include_user=False):
        """Convert doctor to dictionary representation"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'specialization': self.specialization,
            'license_number': self.license_number,
            'phone': self.phone,
            'bio': self.bio,
            'schedule': self.schedule or {},
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_user and self.user:
            data['name'] = self.user.name
            data['email'] = self.user.email
        
        return data
    
    def get_available_slots(self, day_of_week: str):
        """Get available time slots for a specific day"""
        if not self.schedule:
            return []
        return self.schedule.get(day_of_week.lower(), [])
    
    def __repr__(self):
        return f"<Doctor(id={self.id}, specialization='{self.specialization}')>"
