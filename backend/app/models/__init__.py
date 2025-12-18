from sqlalchemy.orm import scoped_session, sessionmaker, declarative_base
from sqlalchemy import create_engine

Base = declarative_base()

# Import all models here
from .user import User
from .doctor import Doctor
from .appointment import Appointment
from .medical_record import MedicalRecord

__all__ = ['Base', 'User', 'Doctor', 'Appointment', 'MedicalRecord']