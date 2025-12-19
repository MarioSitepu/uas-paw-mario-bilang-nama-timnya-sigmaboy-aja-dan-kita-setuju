"""Initial migration - create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2024-12-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if tables already exist (for existing databases)
    from sqlalchemy import inspect
    conn = op.get_bind()
    inspector = inspect(conn)
    existing_tables = set(inspector.get_table_names())
    
    # Create users table
    if 'users' not in existing_tables:
        op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('password_hash', sa.String(length=256), nullable=False),
        sa.Column('salt', sa.String(length=64), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='patient'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
        )
    else:
        print("Table 'users' already exists, skipping creation")
    
    # Create doctors table
    if 'doctors' not in existing_tables:
        op.create_table('doctors',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('specialization', sa.String(length=100), nullable=False),
        sa.Column('license_number', sa.String(length=50), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('schedule', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('license_number'),
        sa.UniqueConstraint('user_id')
        )
    else:
        print("Table 'doctors' already exists, skipping creation")
    
    # Create appointments table
    if 'appointments' not in existing_tables:
        op.create_table('appointments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=False),
        sa.Column('appointment_date', sa.Date(), nullable=False),
        sa.Column('appointment_time', sa.Time(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['patient_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
        )
    else:
        print("Table 'appointments' already exists, skipping creation")
    
    # Create medical_records table
    if 'medical_records' not in existing_tables:
        op.create_table('medical_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('appointment_id', sa.Integer(), nullable=False),
        sa.Column('diagnosis', sa.Text(), nullable=False),
        sa.Column('symptoms', sa.Text(), nullable=True),
        sa.Column('treatment', sa.Text(), nullable=True),
        sa.Column('prescription', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('appointment_id')
        )
    else:
        print("Table 'medical_records' already exists, skipping creation")
    
    # Create indexes for better query performance (only if they don't exist)
    if 'users' not in existing_tables:
        op.create_index('ix_users_email', 'users', ['email'])
        op.create_index('ix_users_role', 'users', ['role'])
    else:
        # Check existing indexes
        try:
            existing_indexes = {idx['name'] for idx in inspector.get_indexes('users')}
            if 'ix_users_email' not in existing_indexes:
                op.create_index('ix_users_email', 'users', ['email'])
            if 'ix_users_role' not in existing_indexes:
                op.create_index('ix_users_role', 'users', ['role'])
        except Exception:
            # If we can't check indexes, try to create them (will fail gracefully if they exist)
            pass
    
    if 'appointments' not in existing_tables:
        op.create_index('ix_appointments_patient_id', 'appointments', ['patient_id'])
        op.create_index('ix_appointments_doctor_id', 'appointments', ['doctor_id'])
        op.create_index('ix_appointments_date', 'appointments', ['appointment_date'])
        op.create_index('ix_appointments_status', 'appointments', ['status'])
    else:
        # Check existing indexes
        try:
            existing_indexes = {idx['name'] for idx in inspector.get_indexes('appointments')}
            if 'ix_appointments_patient_id' not in existing_indexes:
                op.create_index('ix_appointments_patient_id', 'appointments', ['patient_id'])
            if 'ix_appointments_doctor_id' not in existing_indexes:
                op.create_index('ix_appointments_doctor_id', 'appointments', ['doctor_id'])
            if 'ix_appointments_date' not in existing_indexes:
                op.create_index('ix_appointments_date', 'appointments', ['appointment_date'])
            if 'ix_appointments_status' not in existing_indexes:
                op.create_index('ix_appointments_status', 'appointments', ['status'])
        except Exception:
            # If we can't check indexes, try to create them (will fail gracefully if they exist)
            pass


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_appointments_status', 'appointments')
    op.drop_index('ix_appointments_date', 'appointments')
    op.drop_index('ix_appointments_doctor_id', 'appointments')
    op.drop_index('ix_appointments_patient_id', 'appointments')
    op.drop_index('ix_users_role', 'users')
    op.drop_index('ix_users_email', 'users')
    
    # Drop tables in reverse order
    op.drop_table('medical_records')
    op.drop_table('appointments')
    op.drop_table('doctors')
    op.drop_table('users')
