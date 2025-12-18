"""Add tokens table

Revision ID: 002_add_tokens
Revises: 001_initial
Create Date: 2024-12-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_add_tokens'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=256), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_tokens_token', 'tokens', ['token'], unique=True)
    op.create_index('ix_tokens_user_id', 'tokens', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_tokens_user_id', 'tokens')
    op.drop_index('ix_tokens_token', 'tokens')
    op.drop_table('tokens')
