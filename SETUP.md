# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Create PostgreSQL Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE nutritioncents;
\q

# Or using createdb
createdb nutritioncents
```

## 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# If your PostgreSQL requires SSL, add ?sslmode=require (code will auto-add if not specified)
DATABASE_URL=postgresql://username:password@localhost:5432/nutritioncents?sslmode=require
POSTGRES_URL=postgresql://username:password@localhost:5432/nutritioncents?sslmode=require

# Or if SSL is not required for localhost:
# DATABASE_URL=postgresql://username:password@localhost:5432/nutritioncents?sslmode=disable

NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# Optional: OpenAI API Key (for AI-powered nutrition extraction)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Generate NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 4. Run Database Schema

```bash
psql -d nutritioncents -f database/schema.sql
```

Or manually execute the SQL in `database/schema.sql` using your database client.

## 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL format: `postgresql://user:pass@host:port/dbname`
- Ensure database exists

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your app URL

### API Errors
- Check browser console for errors
- Verify database tables exist (run schema.sql)
- Check server logs for detailed errors
