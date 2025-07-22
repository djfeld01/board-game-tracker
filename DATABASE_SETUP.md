# Local Database Setup Options

## Option 1: Docker (Recommended) 

If you don't have Docker installed, you can install it from:
- **Docker Desktop**: https://www.docker.com/products/docker-desktop/

Once Docker is installed, run:
```bash
docker compose up -d
```

This will start a PostgreSQL database with:
- Database: `boardgame_tracker`
- Username: `boardgame_user`
- Password: `boardgame_password`
- Port: `5432`

## Option 2: Homebrew (macOS)

Install PostgreSQL using Homebrew:
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database and user
psql postgres
CREATE DATABASE boardgame_tracker;
CREATE USER boardgame_user WITH PASSWORD 'boardgame_password';
GRANT ALL PRIVILEGES ON DATABASE boardgame_tracker TO boardgame_user;
\q
```

## Option 3: Postgres.app (macOS - GUI)

Download and install from: https://postgresapp.com/

Then create the database using the GUI or terminal.

## Option 4: Use Supabase Local Development

Install Supabase CLI:
```bash
npm install -g supabase
supabase init
supabase start
```

## Database Setup Commands

Once your database is running, execute these commands:

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

## Connection Testing

Test your database connection:
```bash
# Install pg client globally
npm install -g pg

# Test connection
psql "postgresql://boardgame_user:boardgame_password@localhost:5432/boardgame_tracker"
```
