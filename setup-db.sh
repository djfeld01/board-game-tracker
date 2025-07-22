#!/bin/bash

# Database setup script for Board Game Tracker
echo "🎲 Setting up Board Game Tracker Database..."

# Database connection details
DB_NAME="boardgame_tracker"
DB_USER="boardgame_user"
DB_PASSWORD="boardgame_password"
DB_HOST="localhost"
DB_PORT="5432"

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on $DB_HOST:$DB_PORT"
    echo "Please start PostgreSQL first:"
    echo "  - Docker: docker compose up -d"
    echo "  - Homebrew: brew services start postgresql@15"
    echo "  - Postgres.app: Start the application"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database and user (connect as superuser)
echo "📝 Creating database and user..."

# Try to create database and user
psql -h $DB_HOST -p $DB_PORT -U postgres -c "
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database and user created successfully"
else
    echo "ℹ️  Database or user might already exist, continuing..."
fi

# Test connection
echo "🔍 Testing database connection..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
    echo ""
    echo "🚀 Database is ready! You can now run:"
    echo "   npm run db:push"
    echo "   npm run dev"
else
    echo "❌ Database connection failed"
    echo "Please check your PostgreSQL installation and credentials"
    exit 1
fi
