"""add_versioning_to_lead_scores

Revision ID: 3253d65ad22a
Revises: a5ce5c602b1d
Create Date: 2025-11-24 18:25:11.132095

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3253d65ad22a'
down_revision: Union[str, Sequence[str], None] = 'a5ce5c602b1d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add versioning columns to lead_scores
    op.add_column('lead_scores', sa.Column('version', sa.Integer(), nullable=True, server_default='1'))
    op.add_column('lead_scores', sa.Column('total_calls_analyzed', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('lead_scores', sa.Column('call_ids_snapshot', sa.JSON(), nullable=True))
    op.add_column('lead_scores', sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True))
    
    # Update existing records to have version 1
    op.execute("UPDATE lead_scores SET version = 1 WHERE version IS NULL")
    op.execute("UPDATE lead_scores SET total_calls_analyzed = 0 WHERE total_calls_analyzed IS NULL")


def downgrade() -> None:
    """Downgrade schema."""
    # Remove versioning columns
    op.drop_column('lead_scores', 'created_at')
    op.drop_column('lead_scores', 'call_ids_snapshot')
    op.drop_column('lead_scores', 'total_calls_analyzed')
    op.drop_column('lead_scores', 'version')
