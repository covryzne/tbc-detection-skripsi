"""Add user_profiles table

Revision ID: 6bd275e15c77
Revises: 7b508c134da4
Create Date: 2025-05-15 12:38:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '6bd275e15c77'
down_revision = '7b508c134da4'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'user_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("uuid_generate_v4()")),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    # Enable uuid-ossp extension if not already enabled
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

def downgrade():
    op.drop_table('user_profiles')
    # Optional: Drop uuid-ossp extension if no other tables use it
    # op.execute('DROP EXTENSION IF EXISTS "uuid-ossp"')