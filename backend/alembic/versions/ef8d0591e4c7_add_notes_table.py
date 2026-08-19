"""add notes table

Revision ID: ef8d0591e4c7
Revises: e99c0e9f0089
Create Date: 2026-08-18 18:27:28.079231

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ef8d0591e4c7'
down_revision: Union[str, Sequence[str], None] = 'e99c0e9f0089'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
