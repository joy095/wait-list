// src/lib/server/db.ts
import pg from 'pg';
import { env } from '$env/dynamic/private'; // Correct import

const { Pool } = pg;

// Ensure DATABASE_URL is set
const databaseUrl = env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set in environment variables');
}

const pool = new Pool({
	connectionString: databaseUrl,
	ssl: {
		rejectUnauthorized: false // Use with caution. Consider proper cert verification in production.
	}
});

pool.on('connect', () => {
	console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
	console.error('Error connecting to PostgreSQL database:', err);
});

export default pool;
