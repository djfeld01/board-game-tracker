# Board Game Tracker

A comprehensive board game collection and play tracking application built with Next.js, TypeScript, Tailwind CSS, PostgreSQL, and Drizzle ORM.

## Features

- 🎲 **Collection Management**: Track your board game collection with detailed information
- 🏆 **Play Logging**: Record game sessions with participants, scores, and notes
- ❤️ **Wishlist**: Keep track of games you want to add to your collection
- 🔀 **Weekly Recommendations**: Get random game suggestions from your collection
- 👥 **Household Sharing**: Share your collection with family members
- 📊 **Statistics**: View detailed analytics about your gaming habits
- 🔐 **Authentication**: Secure user accounts with NextAuth.js

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd board-game-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Install and start PostgreSQL:
```bash
# Install PostgreSQL via Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create the database
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
createdb boardgame_tracker
```

4. Set up the database schema:
```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/boardgame_tracker" npm run db:push
```

5. Start the development server:
```bash
# Option 1: Use the provided script
./dev.sh

# Option 2: Set environment variable manually
DATABASE_URL="postgresql://$(whoami)@localhost:5432/boardgame_tracker" npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main entities:

- **Users**: User accounts and authentication
- **Households**: Groups of users sharing collections
- **Board Games**: Game collection with detailed metadata
- **Game Plays**: Individual play sessions with participants
- **Wishlists**: Games users want to acquire
- **Weekly Recommendations**: Automated game suggestions

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── api/               # API routes
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
│   ├── db/               # Database schema and connection
│   └── utils/            # Helper functions
└── types/                # TypeScript type definitions
```

## Key Features Explained

### Household System
Users can create or join households to share board game collections. Each household has:
- A unique invite code for joining
- Multiple members with different roles (owner/member)
- Shared game collection and play history

### Weekly Recommendations
The system automatically suggests 2 random games from your collection each week:
- Avoids recently played games (last 4 weeks)
- Allows selection of one game to play
- Tracks whether the recommended game was actually played

### Play Tracking
Comprehensive game session logging including:
- Date, duration, and location
- Multiple participants with scores and positions
- Winner tracking
- Team game support
- Notes and additional details

## Development

### Quick Start
```bash
# Start PostgreSQL (if not already running)
brew services start postgresql@15

# Start development server
./dev.sh
```

### Database Commands

```bash
# Generate migration files after schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Push schema changes directly (development)
DATABASE_URL="postgresql://$(whoami)@localhost:5432/boardgame_tracker" npm run db:push

# Open Drizzle Studio for database management
DATABASE_URL="postgresql://$(whoami)@localhost:5432/boardgame_tracker" npm run db:studio
```

### Building for Production

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Roadmap

- [ ] BoardGameGeek API integration
- [ ] Game recommendation algorithms based on play history
- [ ] Mobile app with React Native
- [ ] Advanced statistics and reporting
- [ ] Game trading/lending between households
- [ ] Tournament and league management
- [ ] Social features and community aspects
- [ ] Game condition tracking and valuation
- [ ] Backup and data export features
- [ ] Multi-language support

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
