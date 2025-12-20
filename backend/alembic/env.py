import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Load environment variables
try:
    from dotenv import load_dotenv
    from pathlib import Path
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
from app.models import Base
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def get_url():
    """Get database URL from environment or config"""
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        # Strip quotes if present
        database_url = database_url.strip('"\'')
        # Convert postgresql:// to postgresql+psycopg://
        if database_url.startswith('postgresql://') and not database_url.startswith('postgresql+psycopg://'):
            database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
        
        # Supabase connection handling
        # NOTE: Supabase free tier only supports IPv6 for direct connections
        # Render is IPv4-only, so MUST use Connection Pooler (port 6543) or Transaction Pooler
        if 'supabase.co' in database_url or 'pooler.supabase.com' in database_url or 'supabase.com' in database_url:
            from urllib.parse import urlparse, urlunparse
            parsed = urlparse(database_url)
            port = parsed.port or 5432
            
            # Always use port 6543 for Supabase on Render (IPv4-only)
            if port != 6543:
                print(f"[ALEMBIC] Converting Supabase connection from port {port} to Connection Pooler port 6543...", file=sys.stderr, flush=True)
                
                # Build new netloc with port 6543
                if '@' in parsed.netloc:
                    # Has authentication: user:pass@host:port
                    auth_part, host_part = parsed.netloc.split('@', 1)
                    hostname = host_part.split(':')[0]  # Remove existing port if any
                    new_netloc = f"{auth_part}@{hostname}:6543"
                else:
                    # No authentication: host:port
                    hostname = parsed.netloc.split(':')[0]  # Remove existing port if any
                    new_netloc = f"{hostname}:6543"
                
                # Reconstruct URL with new netloc
                new_parsed = parsed._replace(netloc=new_netloc)
                database_url = urlunparse(new_parsed)
                print(f"[ALEMBIC] Using Connection Pooler URL (port 6543)", file=sys.stderr, flush=True)
            
            # Add connection parameters if not present
            if '?' in database_url:
                if 'connect_timeout' not in database_url:
                    database_url += '&connect_timeout=10'
            else:
                database_url += '?connect_timeout=10'
            # Ensure sslmode is set
            if 'sslmode' not in database_url:
                database_url += '&sslmode=require' if '?' in database_url else '?sslmode=require'
        
        return database_url
    return config.get_main_option("sqlalchemy.url")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
