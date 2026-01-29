// Test database connection
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL or POSTGRES_URL not set in .env');
  process.exit(1);
}

console.log('Testing database connection...');

const sql = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

sql`SELECT 1 as test`
  .then(() => {
    console.log('✅ Database connection successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. PostgreSQL is running');
    console.error('2. DATABASE_URL format: postgresql://user:pass@host:port/dbname');
    console.error('3. Database "nutritioncents" exists');
    process.exit(1);
  });
