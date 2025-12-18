from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from . import Base
import datetime

class Token(Base):
    """Authentication token model - stored in database instead of memory"""
    __tablename__ = 'tokens'
    
    id = Column(Integer, primary_key=True)
    token = Column(String(256), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="tokens")
    
    def is_expired(self) -> bool:
        """Check if token has expired"""
        return datetime.datetime.now() > self.expires_at
    
    def to_dict(self):
        """Convert token to dictionary"""
        return {
            'id': self.id,
            'token': self.token,
            'user_id': self.user_id,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_expired': self.is_expired()
        }
