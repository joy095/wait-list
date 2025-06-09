// src/routes/api/contact/+server.ts
import { json } from '@sveltejs/kit';
import pool from '$lib/server/db'; // Import your PostgreSQL pool

/**
 * Handles POST requests to store contact form data in the database.
 */
export async function POST({ request }) {
    try {
        const { email, name, message } = await request.json();

        // Basic server-side validation
        if (!email || !name || !message) {
            console.error('Server-side validation failed: Missing required fields.');
            return json({ message: 'Missing required fields' }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            console.error('Server-side validation failed: Invalid email format.');
            return json({ message: 'Invalid email format' }, { status: 400 });
        }

        // Insert data into the database
        const result = await pool.query(
            'INSERT INTO contact_submissions (name, email, message) VALUES ($1, $2, $3) RETURNING id',
            [name, email, message]
        );

        console.log(`Contact submission stored with ID: ${result.rows[0].id}`);

        return json({ message: 'Message submitted successfully!' }, { status: 200 });

    } catch (error) {
        console.error('Error storing contact submission:', error);
        return json({ message: 'Failed to submit message.' }, { status: 500 });
    }
}