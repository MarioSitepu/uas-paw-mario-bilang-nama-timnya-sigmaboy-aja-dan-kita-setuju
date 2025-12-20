#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script untuk migrasi database dari Neon ke Supabase
Usage: python migrate_neon_to_supabase.py
"""

import os
import sys
# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except:
        pass
from pathlib import Path
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from urllib.parse import urlparse
import json
from datetime import datetime, date, time
from decimal import Decimal
# JSON handling - SQLAlchemy will handle JSON automatically

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    # Load .env file from backend directory
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Loaded .env file from: {env_path}")
    else:
        print(f"⚠️  .env file not found at: {env_path}")
except ImportError:
    print("⚠️  python-dotenv not installed, skipping .env file loading")
    print("   Install with: pip install python-dotenv")

# Connection strings
NEON_URL = "postgresql://neondb_owner:npg_UTPw63cQrWFd@ep-billowing-resonance-a1xc0z9x-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Supabase URL dari environment atau .env file
SUPABASE_URL = os.environ.get('DATABASE_URL', '')
if not SUPABASE_URL:
    print("[ERROR] DATABASE_URL untuk Supabase tidak ditemukan!")
    print("   Pastikan DATABASE_URL ada di file .env atau environment variable")
    print("   Contoh di .env: DATABASE_URL=postgresql+psycopg://postgres.eeygswpiygbqdztagizv:password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres")
    sys.exit(1)

# Convert postgresql:// to postgresql+psycopg:// untuk psycopg3
if NEON_URL.startswith('postgresql://') and not NEON_URL.startswith('postgresql+psycopg://'):
    NEON_URL = NEON_URL.replace('postgresql://', 'postgresql+psycopg://', 1)

if SUPABASE_URL.startswith('postgresql://') and not SUPABASE_URL.startswith('postgresql+psycopg://'):
    SUPABASE_URL = SUPABASE_URL.replace('postgresql://', 'postgresql+psycopg://', 1)

# Strip quotes if present
SUPABASE_URL = SUPABASE_URL.strip('"\'')

print("=" * 80)
print("🚀 MIGRASI DATABASE: NEON → SUPABASE")
print("=" * 80)
print(f"📦 Source (Neon): {NEON_URL.split('@')[0]}@...")
print(f"📦 Target (Supabase): {SUPABASE_URL.split('@')[0] if '@' in SUPABASE_URL else SUPABASE_URL[:50]}@...")
print("=" * 80)

# Create engines
try:
    print("\n🔌 Menghubungkan ke database Neon...")
    neon_engine = create_engine(NEON_URL, echo=False, pool_pre_ping=True)
    neon_conn = neon_engine.connect()
    print("✅ Terhubung ke Neon")
except Exception as e:
    print(f"❌ Error koneksi ke Neon: {e}")
    sys.exit(1)

try:
    print("🔌 Menghubungkan ke database Supabase...")
    supabase_engine = create_engine(SUPABASE_URL, echo=False, pool_pre_ping=True)
    supabase_conn = supabase_engine.connect()
    print("✅ Terhubung ke Supabase")
except Exception as e:
    print(f"❌ Error koneksi ke Supabase: {e}")
    neon_conn.close()
    sys.exit(1)

# Tabel yang akan dimigrasi (dalam urutan yang benar untuk foreign keys)
TABLES = [
    'users',        # No dependencies
    'doctors',      # Depends on users
    'tokens',       # Depends on users
    'appointments', # Depends on users and doctors
    'medical_records', # Depends on appointments
]

def get_table_data(conn, table_name):
    """Mengambil semua data dari tabel dengan handling tipe data yang benar"""
    try:
        result = conn.execute(text(f"SELECT * FROM {table_name} ORDER BY id"))
        columns = result.keys()
        rows = result.fetchall()
        data = []
        for row in rows:
            row_dict = {}
            for col, val in zip(columns, row):
                # Handle special types - keep as-is untuk SQLAlchemy parameter binding
                if val is None:
                    row_dict[col] = None
                elif isinstance(val, (date, time, datetime)):
                    # Keep date/time objects as-is, SQLAlchemy will handle conversion
                    row_dict[col] = val
                elif isinstance(val, dict):
                    # JSON columns - keep as dict, SQLAlchemy JSON type will handle
                    row_dict[col] = val
                elif isinstance(val, (list, tuple)):
                    # Convert to list for JSON
                    row_dict[col] = list(val)
                elif isinstance(val, Decimal):
                    # Convert Decimal to float
                    row_dict[col] = float(val)
                else:
                    row_dict[col] = val
            data.append(row_dict)
        return data
    except Exception as e:
        print(f"⚠️  Error membaca tabel {table_name}: {e}")
        import traceback
        traceback.print_exc()
        return []

def check_table_exists(conn, table_name):
    """Cek apakah tabel ada"""
    inspector = inspect(conn)
    return table_name in inspector.get_table_names()

def get_table_columns(conn, table_name):
    """Mendapatkan daftar kolom dari tabel"""
    try:
        inspector = inspect(conn)
        columns = inspector.get_columns(table_name)
        return {col['name'] for col in columns}
    except Exception as e:
        print(f"   ⚠️  Error mendapatkan kolom dari {table_name}: {e}")
        return set()

def get_sequence_value(conn, sequence_name):
    """Mendapatkan nilai sequence saat ini"""
    try:
        result = conn.execute(text(f"SELECT last_value FROM {sequence_name}"))
        return result.scalar()
    except:
        return None

def migrate_table(neon_conn, supabase_conn, table_name):
    """Migrasi data dari satu tabel"""
    print(f"\n📋 Migrasi tabel: {table_name}")
    
    # Cek apakah tabel ada di source
    if not check_table_exists(neon_conn, table_name):
        print(f"   ⚠️  Tabel {table_name} tidak ditemukan di Neon, skip...")
        return 0
    
    # Cek apakah tabel ada di target
    if not check_table_exists(supabase_conn, table_name):
        print(f"   ⚠️  Tabel {table_name} tidak ditemukan di Supabase, skip...")
        return 0
    
    # Ambil data dari Neon
    data = get_table_data(neon_conn, table_name)
    if not data:
        print(f"   ℹ️  Tabel {table_name} kosong, skip...")
        return 0
    
    print(f"   📊 Ditemukan {len(data)} baris")
    
    # Dapatkan kolom yang ada di target table
    target_columns = get_table_columns(supabase_conn, table_name)
    if not target_columns:
        print(f"   ⚠️  Tidak bisa mendapatkan kolom dari tabel {table_name}, skip...")
        return 0
    
    # Migrasi data
    migrated = 0
    failed = 0
    
    for idx, row in enumerate(data, 1):
        try:
            # Filter kolom yang ada di target dan prepare data
            row_data = {}
            for key, value in row.items():
                # Skip kolom yang tidak ada di target
                if key not in target_columns:
                    continue
                
                # Handle JSON columns - convert to JSON string
                if isinstance(value, dict):
                    # Convert dict to JSON string untuk PostgreSQL JSON type
                    row_data[key] = json.dumps(value)
                elif isinstance(value, list):
                    # List as JSON
                    row_data[key] = json.dumps(value)
                else:
                    # Keep other types as-is (date, time, datetime, strings, numbers)
                    row_data[key] = value
            
            if not row_data:
                print(f"\n   ⚠️  Tidak ada kolom yang cocok untuk baris {row.get('id', idx)}")
                failed += 1
                continue
            
            # Build INSERT statement
            columns = list(row_data.keys())
            placeholders = ', '.join([':' + col for col in columns])
            columns_str = ', '.join(columns)
            
            # Use ON CONFLICT DO NOTHING untuk menghindari duplicate
            # Cast JSON columns explicitly
            json_columns = ['schedule']  # Kolom yang bertipe JSON
            casted_placeholders = []
            for col in columns:
                if col in json_columns and col in row_data and isinstance(row_data[col], str):
                    # Cast JSON string to JSON type
                    casted_placeholders.append(f"CAST(:{col} AS JSONB)")
                else:
                    casted_placeholders.append(f":{col}")
            
            insert_sql = f"""
                INSERT INTO {table_name} ({columns_str})
                VALUES ({', '.join(casted_placeholders)})
                ON CONFLICT (id) DO NOTHING
            """
            
            # Execute insert dengan parameter binding
            supabase_conn.execute(
                text(insert_sql),
                row_data
            )
            # Commit per baris untuk menghindari transaction abort
            supabase_conn.commit()
            migrated += 1
            
            # Progress indicator setiap 10 baris
            if idx % 10 == 0:
                print(f"   ⏳ Progress: {idx}/{len(data)}...", end='\r')
            
        except Exception as e:
            # Rollback untuk baris yang error
            supabase_conn.rollback()
            failed += 1
            row_id = row.get('id', f'row-{idx}')
            error_str = str(e).lower()
            # Skip error yang tidak penting
            if 'duplicate' not in error_str and 'conflict' not in error_str and 'foreign key' not in error_str:
                print(f"\n   ⚠️  Error migrasi baris {row_id}: {str(e)[:100]}")
            continue
    
    if len(data) > 10:
        print()  # New line after progress indicator
    
    print(f"   ✅ Berhasil: {migrated}, ❌ Gagal: {failed}")
    
    # Update sequence jika ada (setelah commit)
    try:
        sequence_name = f"{table_name}_id_seq"
        result = neon_conn.execute(text(f"SELECT last_value FROM {sequence_name}"))
        last_value = result.scalar()
        if last_value and last_value > 0:
            # Get current max ID from Supabase
            max_result = supabase_conn.execute(text(f"SELECT COALESCE(MAX(id), 0) FROM {table_name}"))
            max_id = max_result.scalar() or 0
            # Set sequence to max of (last_value from Neon, max_id from Supabase)
            new_seq_value = max(last_value, max_id)
            supabase_conn.execute(text(f"SELECT setval('{sequence_name}', {new_seq_value}, true)"))
            print(f"   🔄 Sequence {sequence_name} diupdate ke {new_seq_value}")
    except Exception as e:
        # Sequence mungkin tidak ada atau sudah di-handle
        pass
    
    return migrated

def main():
    """Main migration function"""
    try:
        # Start transaction di Supabase
        print("\n🔄 Memulai migrasi...")
        
        total_migrated = 0
        
        # Migrasi setiap tabel
        for table in TABLES:
            count = migrate_table(neon_conn, supabase_conn, table)
            total_migrated += count
            # Commit sudah dilakukan per baris di migrate_table
        
        print("\n" + "=" * 80)
        print(f"✅ MIGRASI SELESAI!")
        print(f"📊 Total baris yang dimigrasi: {total_migrated}")
        print("=" * 80)
        
        # Verifikasi
        print("\n🔍 Verifikasi data...")
        for table in TABLES:
            if check_table_exists(neon_conn, table) and check_table_exists(supabase_conn, table):
                neon_count = len(get_table_data(neon_conn, table))
                supabase_count = len(get_table_data(supabase_conn, table))
                status = "✅" if neon_count == supabase_count else "⚠️"
                print(f"   {status} {table}: Neon={neon_count}, Supabase={supabase_count}")
        
    except Exception as e:
        print(f"\n❌ Error selama migrasi: {e}")
        import traceback
        traceback.print_exc()
        supabase_conn.rollback()
    finally:
        # Close connections
        neon_conn.close()
        supabase_conn.close()
        neon_engine.dispose()
        supabase_engine.dispose()
        print("\n🔌 Koneksi ditutup")

if __name__ == '__main__':
    # Konfirmasi sebelum migrasi
    print("\n⚠️  PERINGATAN:")
    print("   Script ini akan menyalin data dari Neon ke Supabase.")
    print("   Data yang sudah ada di Supabase dengan ID yang sama akan di-skip (ON CONFLICT DO NOTHING).")
    print("   Pastikan Anda sudah backup database Supabase jika diperlukan.")
    print()
    
    response = input("Lanjutkan migrasi? (yes/no): ").strip().lower()
    if response not in ['yes', 'y']:
        print("❌ Migrasi dibatalkan")
        sys.exit(0)
    
    main()

