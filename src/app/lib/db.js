const postgres = require('postgres');

let sql;

try {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.warn('⚠️  Warning: DATABASE_URL or POSTGRES_URL not set. Database features will not work.');
    // Create a stub that throws helpful errors
    const stub = async () => {
      throw new Error('Database not configured. Please set DATABASE_URL or POSTGRES_URL in .env');
    };
    sql = new Proxy({}, {
      get: () => stub,
      apply: () => stub,
    });
    sql.begin = stub;
  } else {
    // Check if it's localhost
    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

    // Parse connection string to check for sslmode
    let finalConnectionString = connectionString;
    const hasSslMode = connectionString.includes('sslmode=');

    // If no sslmode specified, add appropriate one
    if (!hasSslMode) {
      // Since the error suggests using sslmode=require, use that
      // For localhost, we can try prefer (allows non-SSL if server allows), but if server requires SSL, use require
      // Based on the error message, server requires SSL, so use require
      finalConnectionString = connectionString.includes('?')
        ? `${connectionString}&sslmode=require`
        : `${connectionString}?sslmode=require`;
    }

    // Enable SSL when sslmode=require (or for remote connections)
    const requiresSsl = finalConnectionString.includes('sslmode=require') || !isLocalhost;
    const sslConfig = requiresSsl
      ? { rejectUnauthorized: false }  // Use SSL but don't verify certificate (for self-signed certs)
      : false;  // Try without SSL for localhost if sslmode=prefer

    sql = postgres(finalConnectionString, {
      ssl: sslConfig,
      onnotice: () => { }, // Suppress notices
      connection: {
        application_name: 'nutritioncents',
      },
      transform: {
        undefined: null,
      },
    });

    console.log('✓ Database connection initialized');
  }
} catch (error) {
  console.error('❌ Database initialization error:', error.message);
  // Create a stub to prevent app crash
  const stub = async () => {
    throw new Error(`Database error: ${error.message}`);
  };
  sql = new Proxy({}, {
    get: () => stub,
    apply: () => stub,
  });
  sql.begin = stub;
}

module.exports = { sql };
