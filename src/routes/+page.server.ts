import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import db from '$lib/server/db';
import { sendConfirmationEmail } from '$lib/server/email';
import pino from 'pino';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    return {
        title: 'Bookings | Premium Waitlist for Top Barbers & Makeup Artists',
        description:
            'Join the exclusive waitlist for Bookings...',
        url: 'https://wait-list-gamma.vercel.app',
        image: 'https://wait-list-gamma.vercel.app/wait-list.jpg"',
        siteName: 'Wail List for Premium Barbers & Makeup Artists',
        twitterHandle: '@JoyKarmakar9871'
    };
};


const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// --- Rate Limiter Config ---
const DEFAULT_MAX_REQUESTS = 5; // Allow 5 form submissions
const DEFAULT_WINDOW_SECONDS = 3600; // 1 hour window
const TRUSTED_PROXIES = ['127.0.0.1', '::1'];

// Base schema with common fields
const baseSchema = z.object({
    firstName: z.string().trim().min(1, { message: 'First name is required.' }),
    lastName: z.string().trim().min(1, { message: 'Last name is required.' }),
    email: z.string().trim().email({ message: 'A valid email is required.' }),
});

// Zod schema for the form data using a discriminated union
const formSchema = z.discriminatedUnion("userType", [
    // Schema for Barber Customers
    baseSchema.extend({
        userType: z.literal("customer_barber"),
        visitFrequency: z.string({ required_error: "Please select your visit frequency." }),
        barberServices: z.array(z.string()).min(1, "Please select at least one service."),
        importantFactors: z.array(z.string()).min(1, "Please select at least one factor."),
        bookingFrustrations: z.string().optional(),
        generalMessage: z.string().optional(),
    }),
    // Schema for Makeup Customers
    baseSchema.extend({
        userType: z.literal("customer_makeup"),
        makeupOccasions: z.array(z.string()).min(1, "Please select at least one occasion."),
        importantFactors: z.array(z.string()).min(1, "Please select at least one factor."),
        bookingFrustrations: z.string().optional(),
        generalMessage: z.string().optional(),
    }),
    // Schema for Barber Shop Owners
    baseSchema.extend({
        userType: z.literal("owner_barber"),
        commissionPreference: z.string({ required_error: "Please select your commission preference." }),
        offerDiscounts: z.string({ required_error: "Please indicate your interest in discounts." }),
        biggestChallenges: z.string().optional(),
    }),
    // Schema for Makeup Artists/Owners
    baseSchema.extend({
        userType: z.literal("owner_makeup"),
        commissionPreference: z.string({ required_error: "Please select your commission preference." }),
        portfolioInterest: z.string({ required_error: "Please indicate your interest in portfolio features." }),
        biggestChallenges: z.string().optional(),
    }),
    // Schema for "Other"
    baseSchema.extend({
        userType: z.literal("other"),
        otherDescription: z.string().min(1, "Please specify your role.")
    })
]);

const getClientIp = (request) => {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddr = request.headers.get('remote-addr') || 'unknown';

    if (forwarded && TRUSTED_PROXIES.includes(remoteAddr)) {
        const ips = forwarded.split(',').map(ip => ip.trim());
        return ips[0] || remoteAddr;
    }

    return realIp || remoteAddr;
};

// Rate limiting function
const checkRateLimit = async (rateLimitKey) => {
    try {
        // First, try to get existing rate limit record
        const existingResult = await db.query(
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
            const windowExpired = now.getTime() > (existing.last_reset.getTime() + (existing.window_seconds * 1000));

            if (windowExpired) {
                // Reset the window
                currentCount = 1;
                lastReset = now;

                await db.query(
                    'UPDATE rate_limits SET count = $1, last_reset = $2, updated_at = NOW() WHERE key = $3',
                    [currentCount, lastReset, rateLimitKey]
                );
            } else {
                // Increment counter
                currentCount = existing.count + 1;
                lastReset = existing.last_reset;

                await db.query(
                    'UPDATE rate_limits SET count = $1, updated_at = NOW() WHERE key = $2',
                    [currentCount, rateLimitKey]
                );
            }
        } else {
            // Create new rate limit record
            await db.query(
                `INSERT INTO rate_limits (key, count, last_reset, window_seconds, limit_per_window, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                [rateLimitKey, currentCount, lastReset, windowSeconds, limitPerWindow]
            );
        }

        logger.debug(`[Rate Limit] Current count: ${currentCount}, Limit: ${limitPerWindow}`);

        if (currentCount > limitPerWindow) {
            const resetTime = new Date(lastReset.getTime() + (windowSeconds * 1000));
            const timeRemainingSeconds = Math.max(0, (resetTime.getTime() - Date.now()) / 1000);

            logger.warn(`[Rate Limit] LIMIT EXCEEDED for key ${rateLimitKey} (${currentCount}/${limitPerWindow})`);

            return {
                allowed: false,
                retryAfter: Math.ceil(timeRemainingSeconds)
            };
        }

        logger.debug(`[Rate Limit] ✅ Request ALLOWED for ${rateLimitKey} (${currentCount}/${limitPerWindow})`);
        return { allowed: true };

    } catch (error) {
        logger.error('[Rate Limit] Error in rate limiting:', error);
        // In case of rate limiting error, allow the request but log the issue
        return { allowed: true };
    }
};

export const actions = {
    submitForm: async ({ request }) => {
        logger.debug('[Form] Starting form submission');

        const clientIp = getClientIp(request);
        logger.debug(`[Form] Request from IP: ${clientIp}`);

        // --- Rate Limiting Check ---
        logger.debug('[Rate Limit] Starting rate limit check...');
        const rateLimitKey = `form:ip:${clientIp}`;
        logger.debug(`[Rate Limit] Rate limit key: ${rateLimitKey}`);

        const rateLimitResult = await checkRateLimit(rateLimitKey);

        if (!rateLimitResult.allowed) {
            const retryMinutes = Math.ceil((rateLimitResult.retryAfter || 0) / 60);
            return fail(429, {
                message: `Too many form submissions. Please try again in ${retryMinutes} minutes.`,
                retryAfter: rateLimitResult.retryAfter
            });
        }

        const formData = await request.formData();
        const data = {
            ...Object.fromEntries(formData),
            barberServices: formData.getAll('barberServices'),
            makeupOccasions: formData.getAll('makeupOccasions'),
            importantFactors: formData.getAll('importantFactors'),
        };

        const validated = formSchema.safeParse(data);

        if (!validated.success) {
            const firstError = Object.values(validated.error.flatten().fieldErrors).flat()[0] || 'Invalid data.';
            return fail(400, { message: firstError, data });
        }

        const { firstName, lastName, email, userType } = validated.data;

        try {
            // Check for existing user
            const existingUser = await db.query('SELECT email FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return fail(409, { message: 'This email is already registered. Thank you!' });
            }

            const verificationToken = randomBytes(32).toString('hex');
            const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Insert data based on user type
            if (userType === 'customer_barber') {
                const { visitFrequency, barberServices, importantFactors, bookingFrustrations, generalMessage } = validated.data;
                await db.query(
                    `INSERT INTO users (first_name, last_name, email, user_type, visit_frequency, barber_services, barber_choice_factors, booking_frustrations, general_message, verification_token, token_expires_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [firstName, lastName, email, userType, visitFrequency, barberServices, importantFactors, bookingFrustrations, generalMessage, verificationToken, tokenExpiresAt]
                );
            } else if (userType === 'customer_makeup') {
                const { makeupOccasions, importantFactors, bookingFrustrations, generalMessage } = validated.data;
                await db.query(
                    `INSERT INTO users (first_name, last_name, email, user_type, makeup_occasions, makeup_artist_choice_factors, booking_frustrations, general_message, verification_token, token_expires_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [firstName, lastName, email, userType, makeupOccasions, importantFactors, bookingFrustrations, generalMessage, verificationToken, tokenExpiresAt]
                );
            } else if (userType === 'owner_barber') {
                const { commissionPreference, offerDiscounts, biggestChallenges } = validated.data;
                await db.query(
                    `INSERT INTO users (first_name, last_name, email, user_type, commission_preference, discount_interest, biggest_challenges, verification_token, token_expires_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [firstName, lastName, email, userType, commissionPreference, offerDiscounts, biggestChallenges, verificationToken, tokenExpiresAt]
                );
            } else if (userType === 'owner_makeup') {
                const { commissionPreference, portfolioInterest, biggestChallenges } = validated.data;
                await db.query(
                    `INSERT INTO users (first_name, last_name, email, user_type, commission_preference, portfolio_interest, biggest_challenges, verification_token, token_expires_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [firstName, lastName, email, userType, commissionPreference, portfolioInterest, biggestChallenges, verificationToken, tokenExpiresAt]
                );
            } else if (userType === 'other') {
                const { otherDescription } = validated.data;
                await db.query(
                    `INSERT INTO users (first_name, last_name, email, user_type, other_description, verification_token, token_expires_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [firstName, lastName, email, userType, otherDescription, verificationToken, tokenExpiresAt]
                );
            }

            await sendConfirmationEmail({ to: email, name: firstName, token: verificationToken });

            logger.info(`[Form] ✅ Form submitted successfully for ${email.replace(/(.{2}).*@/, '$1***@')}`);
            return { type: 'success' };

        } catch (error) {
            logger.error('[Form] Form submission error:', error);
            return fail(500, { message: 'An internal server error occurred. Please try again.' });
        }
    }
};


