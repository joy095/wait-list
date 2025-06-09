// src/routes/api/contact/+server.ts
import { json } from '@sveltejs/kit';
import pool from '$lib/server/db'; // Import your PostgreSQL pool
import pino from 'pino'; // For logging, if you want to use it

const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// --- Rate Limiter Configuration ---
// Maximum number of requests allowed within the defined window
const DEFAULT_MAX_REQUESTS = 10;
// Time window in seconds (e.g., 1800 seconds = 30 minutes)
const DEFAULT_WINDOW_SECONDS = 1800;
// Add any trusted proxy IPs your server might be behind.
// This helps ensure accurate client IP identification.
const TRUSTED_PROXIES = ['127.0.0.1', '::1'];

/**
 * Extracts the client's IP address from the request headers.
 * Considers 'x-forwarded-for' if the request comes from a trusted proxy.
 * @param {Request} request The incoming SvelteKit request object.
 * @returns {string} The client's IP address or 'unknown' if it cannot be determined.
 */
const getClientIp = (request: Request): string => {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    // Fallback if no specific header is found, or if not behind a proxy
    const remoteAddr = request.headers.get('remote-addr') || 'unknown';

    // If the request came via a trusted proxy, use the first IP in x-forwarded-for
    if (forwarded && TRUSTED_PROXIES.includes(remoteAddr)) {
        const ips = forwarded.split(',').map(ip => ip.trim());
        return ips[0] || remoteAddr;
    }

    // Otherwise, prefer x-real-ip or the direct remote address
    return realIp || remoteAddr;
};

/**
 * Checks and updates the rate limit for a given key.
 * @param {string} rateLimitKey A unique identifier for the rate limit (e.g., client IP).
 * @returns {Promise<{allowed: boolean, retryAfter?: number}>} An object indicating if the request is allowed,
 * and optionally, the number of seconds to wait before retrying.
 */
const checkRateLimit = async (rateLimitKey: string): Promise<{ allowed: boolean, retryAfter?: number }> => {
    try {
        // Attempt to retrieve an existing rate limit record for the key
        const existingResult = await pool.query(
            'SELECT count, last_reset, window_seconds, limit_per_window FROM rate_limits WHERE key = $1',
            [rateLimitKey]
        );

        const now = new Date();
        let currentCount = 1;
        let lastReset = now;
        const windowSeconds = DEFAULT_WINDOW_SECONDS;
        const limitPerWindow = DEFAULT_MAX_REQUESTS;

        if (existingResult.rows.length > 0) {
            const existing = existingResult.rows[0];
            // Check if the current rate limit window has expired
            const windowExpired = now.getTime() > (existing.last_reset.getTime() + (existing.window_seconds * 1000));

            if (windowExpired) {
                // If the window expired, reset the count and the last reset time
                currentCount = 1;
                lastReset = now;

                await pool.query(
                    'UPDATE rate_limits SET count = $1, last_reset = $2, updated_at = NOW() WHERE key = $3',
                    [currentCount, lastReset, rateLimitKey]
                );
            } else {
                // If the window is still active, just increment the count
                currentCount = existing.count + 1;
                lastReset = existing.last_reset; // Maintain the original window's last_reset time

                await pool.query(
                    'UPDATE rate_limits SET count = $1, updated_at = NOW() WHERE key = $2',
                    [currentCount, rateLimitKey]
                );
            }
        } else {
            // If no record exists for this key, create a new one
            await pool.query(
                `INSERT INTO rate_limits (key, count, last_reset, window_seconds, limit_per_window, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                [rateLimitKey, currentCount, lastReset, windowSeconds, limitPerWindow]
            );
        }

        logger.debug(`[Rate Limit] Key: ${rateLimitKey}, Current count: ${currentCount}, Limit: ${limitPerWindow}`);

        // If the current count exceeds the allowed limit, the request is not allowed
        if (currentCount > limitPerWindow) {
            // Calculate when the client can retry the request
            const resetTime = new Date(lastReset.getTime() + (windowSeconds * 1000));
            const timeRemainingSeconds = Math.max(0, (resetTime.getTime() - Date.now()) / 1000);

            logger.warn(`[Rate Limit] LIMIT EXCEEDED for key ${rateLimitKey} (Count: ${currentCount}/${limitPerWindow})`);

            return {
                allowed: false,
                retryAfter: Math.ceil(timeRemainingSeconds) // Provide time in seconds
            };
        }

        logger.debug(`[Rate Limit] ✅ Request ALLOWED for ${rateLimitKey} (Count: ${currentCount}/${limitPerWindow})`);
        return { allowed: true };

    } catch (error) {
        logger.error('[Rate Limit] Error in rate limiting mechanism:', error);
        // In case of any error in the rate limiting process (e.g., database connection issue),
        // we'll default to allowing the request to avoid blocking legitimate users.
        return { allowed: true };
    }
};



// `POST` Request Handler with Rate Limiting


/**
 * Handles POST requests to store contact form data in the database, with rate limiting.
 */
export async function POST({ request }) {
    // Determine the client's IP address to use as the unique rate limit key
    const clientIp = getClientIp(request);
    const rateLimitKey = `contact_form_submission:${clientIp} `;

    // Perform rate limit check before processing the form data
    const { allowed, retryAfter } = await checkRateLimit(rateLimitKey);



    if (!allowed) {
        // If the request is rate-limited, return a 429 Too Many Requests response
        return json(
            { message: `Too many requests. Please try again after ${((retryAfter ?? 0) / 60).toFixed(0)} minutes.` },
            {
                status: 429, // HTTP 429 Too Many Requests status code
                headers: {
                    'Retry-After': retryAfter.toString() // Inform the client when they can retry
                }
            }
        );
    }

    try {
        const { email, name, message } = await request.json();

        // Basic server-side validation for required fields
        if (!email || !name || !message) {
            console.error('Server-side validation failed: Missing required fields.');
            return json({ message: 'Missing required fields' }, { status: 400 });
        }
        // Basic server-side validation for email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            console.error('Server-side validation failed: Invalid email format.');
            return json({ message: 'Invalid email format' }, { status: 400 });
        }

        // Insert validated data into the database
        const result = await pool.query(
            'INSERT INTO contact_submissions (name, email, message) VALUES ($1, $2, $3) RETURNING id',
            [name, email, message]
        );

        console.log(`Contact submission stored with ID: ${result.rows[0].id} `);

        // Return a success response
        return json({ message: 'Message submitted successfully!' }, { status: 200 });

    } catch (error) {
        // Log and return an error response if something goes wrong during submission
        console.error('Error storing contact submission:', error);
        return json({ message: 'Failed to submit message.' }, { status: 500 });
    }
}