from sqlalchemy.orm import DeclarativeBase, scoped_session, sessionmaker
from sqlalchemy import create_engine

class Base(DeclarativeBase):
    pass

# Import all models here
from .user import User
from .doctor import Doctor
from .appointment import Appointment
from .medical_record import MedicalRecord

__all__ = ['Base', 'User', 'Doctor', 'Appointment', 'MedicalRecord']