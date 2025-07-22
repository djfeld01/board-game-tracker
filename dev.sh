#!/bin/bash

# Load environment variables and start development server
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
export DATABASE_URL="postgresql://davidfeldman@localhost:5432/boardgame_tracker"

echo "🎲 Starting Board Game Tracker..."
echo "Database: $DATABASE_URL"
echo "Starting development server..."

npm run dev
