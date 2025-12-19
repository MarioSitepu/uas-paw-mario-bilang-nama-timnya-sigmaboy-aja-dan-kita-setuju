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
    # Check if table already exists (for existing databases)
    from sqlalchemy import inspect
    conn = op.get_bind()
    inspector = inspect(conn)
    existing_tables = set(inspector.get_table_names())
    
    if 'tokens' not in existing_tables:
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
    else:
        print("Table 'tokens' already exists, skipping creation")
        # Check and create indexes if they don't exist
        try:
            existing_indexes = {idx['name'] for idx in inspector.get_indexes('tokens')}
            if 'ix_tokens_token' not in existing_indexes:
                op.create_index('ix_tokens_token', 'tokens', ['token'], unique=True)
            if 'ix_tokens_user_id' not in existing_indexes:
                op.create_index('ix_tokens_user_id', 'tokens', ['user_id'])
        except Exception:
            pass


def downgrade() -> None:
    op.drop_index('ix_tokens_user_id', 'tokens')
    op.drop_index('ix_tokens_token', 'tokens')
    op.drop_table('tokens')
