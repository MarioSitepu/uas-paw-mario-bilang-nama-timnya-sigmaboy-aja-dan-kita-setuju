"""add profile picture column

Revision ID: 003
Revises: 002
Create Date: 2025-12-18

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('profile_picture', sa.String(500), nullable=True))


def downgrade():
    op.drop_column('users', 'profile_picture')
