"""Add profile_photo_url to users table

Revision ID: 003_add_profile_photo
Revises: 002_add_tokens
Create Date: 2025-12-19

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003_add_profile_photo'
down_revision = '002_add_tokens'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add profile_photo_url column to users table
    op.add_column('users', sa.Column('profile_photo_url', sa.String(500), nullable=True))


def downgrade() -> None:
    # Remove profile_photo_url column from users table
    op.drop_column('users', 'profile_photo_url')
