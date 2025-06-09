import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { SubscriptionRequestBody } from '$lib/types';
import db from '$lib/server/db';
import { v4 as uuidv4 } from 'uuid';
import { sendConfirmationEmail } from '$lib/server/email';

// Custom rate limiting function
const checkRateLimit = async (clientIp: string): Promise<{ allowed: boolean; retryAfter?: number }> => {
    const windowSeconds = 3600; // 1 hour
    const limitPerWindow = 1;
    const now = new Date();

    try {
        // Get or create rate limit record
        const result = await db.query(
            `INSERT INTO rate_limits (key, count, last_reset, window_seconds, limit_per_window, updated_at)
             VALUES ($1, 1, $2, $3, $4, $2)
             ON CONFLICT (key) DO UPDATE SET
                 count = CASE
                     WHEN rate_limits.last_reset + INTERVAL '1 second' * rate_limits.window_seconds <= $2
                     THEN 1
                     ELSE rate_limits.count + 1
                 END,
                 last_reset = CASE
                     WHEN rate_limits.last_reset + INTERVAL '1 second' * rate_limits.window_seconds <= $2
                     THEN $2
                     ELSE rate_limits.last_reset
                 END,
                 updated_at = $2
             RETURNING count, last_reset, window_seconds, limit_per_window`,
            [clientIp, now, windowSeconds, limitPerWindow]
        );

        if (result.rows[0]) {
            const { count, last_reset, window_seconds, limit_per_window } = result.rows[0];

            if (count > limit_per_window) {
                const resetTime = new Date(last_reset.getTime() + (window_seconds * 1000));
                const retryAfter = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);
                return { allowed: false, retryAfter: Math.max(retryAfter, 60) };
            }
        }

        return { allowed: true };
    } catch (error) {
        console.error('[API] Rate limit check error:', error);
        // If rate limiting fails, allow the request to proceed
        return { allowed: true };
    }
};

const getClientIp = (request: Request): string => {
    const forwarded = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const realIp = request.headers.get('x-real-ip');
    if (forwarded) {
        const ips = forwarded.split(',').map(ip => ip.trim());
        return ips[0];
    }
    return realIp || request.headers.get('remote-addr') || 'unknown';
};

export const POST: RequestHandler = async ({ request }) => {
    console.log('[API] Starting subscription request');

    let requestBody: SubscriptionRequestBody;
    const clientIp = getClientIp(request);
    console.log(`[API] Request from IP: ${clientIp}`);

    try {
        requestBody = await request.json();
    } catch (err) {
        console.error('[API] Failed to parse request body:', err);
        return json({ message: 'Invalid request body format.' }, { status: 400 });
    }

    const { email, name, phone, addressCity, addressState, message } = requestBody;
    if (!email) return json({ message: 'Email address is required.' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ message: 'Please enter a valid email address format.' }, { status: 400 });
    if (!name || !addressCity || !addressState) return json({ message: 'Name, City, and State are required.' }, { status: 400 });

    // Check rate limit
    const rateLimitResult = await checkRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
        const retryMinutes = Math.ceil((rateLimitResult.retryAfter || 60) / 60);
        return json({
            message: `Too many attempts. Please try again in ${retryMinutes} minutes.`,
            retryAfter: rateLimitResult.retryAfter
        }, {
            status: 429,
            headers: {
                'Retry-After': (rateLimitResult.retryAfter || 60).toString()
            }
        });
    }

    try {
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
            [email, token, name, phone, addressCity, addressState, message]
        );

        if (result.rowCount > 0) {
            const { status: subscriberStatus, email: subscriberEmail } = result.rows[0];
            if (subscriberStatus === 'confirmed') {
                return json({ message: 'You are already subscribed and confirmed!' }, { status: 200 });
            }

            try {
                await sendConfirmationEmail({ to: subscriberEmail, name, token });
                return json({ message: 'Please check your email to confirm your subscription!' }, { status: 200 });
            } catch (err) {
                console.error('[API] Email send error:', err);
                return json({
                    message: "Subscription saved! Check your email or contact support if you don't receive confirmation."
                }, { status: 200 });
            }
        }

        console.error('[API] No rows returned from DB for users table:', email);
        return json({ message: 'Subscription failed. Please try again.' }, { status: 500 });
    } catch (dbError) {
        console.error('[API] DB error inserting/updating user:', dbError);
        return json({ message: 'Database error occurred. Please try again later.' }, { status: 500 });
    }
};