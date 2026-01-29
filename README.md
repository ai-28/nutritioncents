# NutritionCents - AI-Powered Nutrition Tracking App

A modern, competitive nutrition tracking application built with Next.js, PostgreSQL, and AI-powered meal extraction.

## Features

- 🎤 **Smart Input**: Voice, text, image, and barcode scanning for meal logging
- 🤖 **AI Extraction**: Automatic nutrition extraction from natural language
- 📊 **Comprehensive Tracking**: Daily, weekly, and monthly nutrition analytics
- 🎯 **Goal Management**: Set and track nutrition goals
- ⚠️ **Safety Features**: Allergy detection and health condition tracking
- 📱 **Modern UI**: Beautiful, responsive interface

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (using `postgres` package)
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, shadcn/ui

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb nutritioncents
```

Or using psql:

```sql
CREATE DATABASE nutritioncents;
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database (use either DATABASE_URL or POSTGRES_URL)
# If PostgreSQL requires SSL, add ?sslmode=require (code will auto-add if not specified)
DATABASE_URL=postgresql://username:password@localhost:5432/nutritioncents?sslmode=require
POSTGRES_URL=postgresql://username:password@localhost:5432/nutritioncents?sslmode=require

# Or if SSL is not required for localhost:
# DATABASE_URL=postgresql://username:password@localhost:5432/nutritioncents?sslmode=disable

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: OpenAI API Key (for AI-powered nutrition extraction)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Generate NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Run Database Migrations

Execute the schema file:

```bash
psql -d nutritioncents -f database/schema.sql
```

Or using a database client, run the contents of `database/schema.sql`.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nutritioncents/
├── database/
│   └── schema.sql              # Database schema
├── src/
│   └── app/
│       ├── api/                # API routes
│       │   ├── auth/           # Authentication
│       │   ├── meals/          # Meal CRUD
│       │   └── nutrition/      # Nutrition data
│       ├── components/         # React components
│       │   ├── layout/         # Layout components
│       │   ├── nutrition/      # Nutrition components
│       │   └── ui/             # UI components
│       ├── lib/                # Utilities
│       │   ├── db/             # Database helpers
│       │   ├── auth.js         # NextAuth config
│       │   └── auth-context.jsx # Auth context
│       └── (main)/             # Main app pages
│           └── client/
│               ├── dashboard/  # Dashboard
│               └── meals/      # Meal pages
└── .env                        # Environment variables
```

## API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Meals
- `GET /api/meals?date=YYYY-MM-DD` - Get meals for date
- `POST /api/meals` - Create meal
- `GET /api/meals/[id]` - Get meal details
- `PATCH /api/meals/[id]` - Update meal
- `DELETE /api/meals/[id]` - Delete meal

### Nutrition
- `GET /api/nutrition/daily?date=YYYY-MM-DD` - Daily nutrition summary
- `POST /api/nutrition/goals` - Create nutrition goal
- `GET /api/nutrition/goals?date=YYYY-MM-DD` - Get active goal
- `POST /api/nutrition/extract` - Extract nutrition from input

## Database Schema

The database includes:
- **users** - User accounts and authentication
- **client_profiles** - Extended user information
- **meals** - Meal records
- **meal_items** - Individual food items
- **nutrition_goals** - Nutrition targets
- **health_goals** - Health objectives
- **allergies** - Allergy tracking
- **health_conditions** - Medical conditions
- **dietary_restrictions** - Dietary preferences
- **daily_nutrition_summary** - Cached daily aggregates

See `database/schema.sql` for full schema.

## AI Integration

The app supports AI-powered nutrition extraction using OpenAI. To enable:

1. Get your OpenAI API key from https://platform.openai.com/api-keys
2. Add `OPENAI_API_KEY` to your `.env` file
3. The extraction endpoint automatically uses OpenAI when the API key is set
4. The extraction endpoint accepts:
   - `input`: Text, voice transcript, or image URL
   - `inputType`: 'text', 'voice', 'image', or 'barcode'
5. Without OpenAI API key, the app falls back to basic pattern matching

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

## Features Roadmap

- [x] User authentication
- [x] Meal logging with AI extraction
- [x] Daily nutrition tracking
- [x] Nutrition goals
- [x] Voice input integration (Web Speech API)
- [x] Image recognition (LLM-powered)
- [x] Barcode scanning (OpenFoodFacts integration)
- [x] Weekly/monthly analytics
- [x] Weight tracking
- [x] Meal templates
- [x] Allergy alerts
- [x] Health condition recommendations

## License

MIT
