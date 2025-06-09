// src/routes/api/subscribe/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { SubscriptionRequestBody } from '$lib/types';
import db from '$lib/server/db';
import { v4 as uuidv4 } from 'uuid';
import { sendConfirmationEmail } from '$lib/server/email';
import sanitizeHtml from 'sanitize-html';
import pino from 'pino';

const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// --- Rate Limiter Config ---
const DEFAULT_MAX_REQUESTS = 1;
const DEFAULT_WINDOW_SECONDS = 3600; // 1 hour
const TRUSTED_PROXIES = ['127.0.0.1', '::1'];

/*
Expected DB Schema:
- Table: users
  - email: varchar (unique)
  - status: varchar ('pending', 'confirmed', 'unsubscribed')
  - confirmation_token: varchar
  - name: varchar
  - phone: varchar (nullable)
  - address_city: varchar
  - address_state: varchar
  - message: text (nullable)
  - created_at: timestamp
  - updated_at: timestamp

- Table: rate_limits
  - key: varchar (unique)
  - count: integer
  - last_reset: timestamp
  - window_seconds: integer
  - limit_per_window: integer
  - created_at: timestamp
  - updated_at: timestamp
*/

interface ApiResponse {
    message: string;
    retryAfter?: number;
}

const sanitizeInput = (input: string | undefined): string | undefined => {
    if (!input) return input;
    return sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {}
    }).trim();
};

const getClientIp = (request: Request): string => {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddr = request.headers.get('remote-addr') || 'unknown';

    if (forwarded && TRUSTED_PROXIES.includes(remoteAddr)) {
        const ips = forwarded.split(',').map(ip => ip.trim());
        return ips[0] || remoteAddr;
    }

    return realIp || remoteAddr;
};

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
    logger.debug('[API] Starting subscription request');

    let requestBody: SubscriptionRequestBody;
    const clientIp = getClientIp(request);
    logger.debug(`[API] Request from IP: ${clientIp}`);

    try {
        requestBody = await request.json();
    } catch (err) {
        logger.error('[API] Failed to parse request body:', err);
        return json({ message: 'Invalid request body format.' } satisfies ApiResponse, { status: 400 });
    }

    const { email, name, phone, addressCity, addressState, message } = requestBody;
    const sanitizedName = sanitizeInput(name);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedAddressCity = sanitizeInput(addressCity);
    const sanitizedAddressState = sanitizeInput(addressState);
    const sanitizedMessage = sanitizeInput(message);

    logger.debug(`[API] Data received: Email: ${email.replace(/(.{2}).*@/, '$1***@')}, Name: ${sanitizedName}, City: ${sanitizedAddressCity}`);

    // --- Basic Validation ---
    if (!email) {
        return json({ message: 'Email address is required.' } satisfies ApiResponse, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ message: 'Please enter a valid email address format.' } satisfies ApiResponse, { status: 400 });
    }
    if (!sanitizedName || !sanitizedAddressCity || !sanitizedAddressState) {
        return json({ message: 'Name, City, and State are required and must be valid.' } satisfies ApiResponse, { status: 400 });
    }

    // --- PostgreSQL Rate Limiting by IP ---
    logger.debug('[Rate Limit] Starting rate limit check...');
    const rateLimitKey = `subscribe:ip:${clientIp}`;
    logger.debug(`[Rate Limit] Rate limit key: ${rateLimitKey}`);

    try {
        await db.query('BEGIN');

        const rateLimitResult = await db.query(
            `
            WITH existing AS (
                SELECT count, last_reset, window_seconds, limit_per_window
                FROM rate_limits
                WHERE key = $1
                FOR UPDATE
            ), upsert AS (
                INSERT INTO rate_limits (key, count, last_reset, window_seconds, limit_per_window, created_at, updated_at)
                SELECT $1, 1, NOW(), $2, $3, NOW(), NOW()
                WHERE NOT EXISTS (SELECT 1 FROM existing)
                RETURNING count, last_reset, window_seconds, limit_per_window
            ), update_count AS (
                SELECT 
                    CASE 
                        WHEN NOW() > last_reset + (window_seconds * INTERVAL '1 second')
                        THEN 1
                        ELSE count + 1
                    END AS new_count,
                    CASE 
                        WHEN NOW() > last_reset + (window_seconds * INTERVAL '1 second')
                        THEN NOW()
                        ELSE last_reset
                    END AS new_last_reset,
                    window_seconds,
                    limit_per_window
                FROM existing
            )
            UPDATE rate_limits
            SET 
                count = update_count.new_count,
                last_reset = update_count.new_last_reset,
                updated_at = NOW()
            FROM update_count
            WHERE rate_limits.key = $1
            RETURNING rate_limits.count, rate_limits.last_reset, rate_limits.window_seconds, rate_limits.limit_per_window
            `,
            [rateLimitKey, DEFAULT_WINDOW_SECONDS, DEFAULT_MAX_REQUESTS]
        );

        const rateLimitRecord = rateLimitResult.rows[0] || (await db.query(
            'SELECT count, last_reset, window_seconds, limit_per_window FROM rate_limits WHERE key = $1',
            [rateLimitKey]
        )).rows[0];

        if (!rateLimitRecord) {
            throw new Error('Rate limit query returned no results');
        }

        const { count: currentCount, window_seconds, limit_per_window, last_reset } = rateLimitRecord;

        logger.debug(`[Rate Limit] Current count: ${currentCount}, Limit: ${limit_per_window}`);

        if (currentCount > limit_per_window) {
            logger.warn(`[Rate Limit] LIMIT EXCEEDED for IP ${clientIp} (${currentCount}/${limit_per_window})`);
            const resetTime = new Date(last_reset.getTime() + (window_seconds * 1000));
            const timeRemainingSeconds = Math.max(0, (resetTime.getTime() - Date.now()) / 1000);

            await db.query('ROLLBACK');
            return json(
                {
                    message: `Too many attempts. Try again in ${Math.ceil(timeRemainingSeconds / 60)} minutes.`,
                    retryAfter: Math.ceil(timeRemainingSeconds)
                } satisfies ApiResponse,
                {
                    status: 429,
                    headers: { 'Retry-After': Math.ceil(timeRemainingSeconds).toString() }
                }
            );
        }

        logger.debug(`[Rate Limit] ✅ Request ALLOWED for ${clientIp} (${currentCount}/${limit_per_window})`);

        // --- Store to DB ---
        const token = uuidv4();
        const result = await db.query(
            `INSERT INTO users(
                email, status, confirmation_token,
                name, phone, address_city, address_state, message
            )
            VALUES($1, 'pending', $2, $3, $4, $5, $6, $7)
            ON CONFLICT (email) DO UPDATE SET
                confirmation_token = EXCLUDED.confirmation_token,
                status = CASE
                    WHEN users.status = 'unsubscribed' THEN 'pending'
                    ELSE users.status
                END,
                name = EXCLUDED.name,
                phone = EXCLUDED.phone,
                address_city = EXCLUDED.address_city,
                address_state = EXCLUDED.address_state,
                message = EXCLUDED.message,
                updated_at = NOW()
            RETURNING id, status, email`,
            [email, token, sanitizedName, sanitizedPhone, sanitizedAddressCity, sanitizedAddressState, sanitizedMessage]
        );

        await db.query('COMMIT');

        if (result.rowCount > 0) {
            const { status: subscriberStatus, email: subscriberEmail } = result.rows[0];

            if (subscriberStatus === 'confirmed') {
                return json({ message: 'You are already subscribed and confirmed!' } satisfies ApiResponse, { status: 200 });
            }

            try {
                await sendConfirmationEmail({ to: subscriberEmail, name: sanitizedName, token });
                return json(
                    { message: 'Please check your email to confirm your subscription!' } satisfies ApiResponse,
                    { status: 200 }
                );
            } catch (err) {
                logger.error('[API] Email send error:', {
                    error: err instanceof Error ? {
                        name: err.name,
                        message: err.message,
                        stack: err.stack
                    } : 'Unknown error',
                    email: subscriberEmail.replace(/(.{2}).*@/, '$1***@')
                });
                // Optionally enqueue email for retry
                // await enqueueEmail({ to: subscriberEmail, name: sanitizedName, token });
                return json(
                    {
                        message:
                            'Subscription saved! Check your email or contact support if you don’t receive confirmation within a few minutes.'
                    } satisfies ApiResponse,
                    { status: 200 }
                );
            }
        }

        logger.error('[API] No rows returned from DB for:', email.replace(/(.{2}).*@/, '$1***@'));
        return json({ message: 'Subscription failed. Please try again.' } satisfies ApiResponse, { status: 500 });
    } catch (dbError: unknown) {
        await db.query('ROLLBACK');
        logger.error('[API] DB error:', {
            error: dbError instanceof Error ? {
                name: dbError.name,
                message: dbError.message,
                stack: dbError.stack,
            } : 'Unknown error',
            email: email.replace(/(.{2}).*@/, '$1***@')
        });
        return json({ message: 'Database error occurred. Please try again later.' } satisfies ApiResponse, { status: 500 });
    }
};