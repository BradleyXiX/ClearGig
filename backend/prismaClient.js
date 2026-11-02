const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

// Ensure SSL is properly configured for cloud PostgreSQL instances like Supabase
const isProduction = process.env.NODE_ENV === 'production';
const isCloudDb = Boolean(
  connectionString && (
    connectionString.includes('supabase.co') ||
    connectionString.includes('pooler.supabase.com') ||
    connectionString.includes('sslmode=require')
  )
);

const poolConfig = {
  connectionString,
  ...(isProduction || isCloudDb
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
};

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
