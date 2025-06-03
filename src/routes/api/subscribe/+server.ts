// src/routes/api/subscribe/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { SubscriptionRequestBody, SubscriptionResponse, ErrorResponse, SubscriberStatus } from '$lib/types';
import db from '$lib/server/db'; // Assuming your database connection is here
import { v4 as uuidv4 } from 'uuid';
import { sendConfirmationEmail } from '$lib/server/email'; // Assuming your email service is here

export const POST: RequestHandler = async ({ request }) => {
    console.log('[API] Starting subscription request');

    try {
        console.log('[API] Parsing request body...');
        const requestBody: SubscriptionRequestBody = await request.json();
        // Destructure 'name' directly from the requestBody
        const { email, name, phone, addressCity, addressState, message } = requestBody;
        console.log(`[API] Data received: Email: ${email}, Name: ${name}, City: ${addressCity}`);

        // --- Server-side Validation ---
        if (!email) {
            console.log('[API] No email provided');
            const errorResponse: ErrorResponse = { message: 'Email address is required.' };
            return json(errorResponse, { status: 400 });
        }

        const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('[API] Invalid email format');
            const errorResponse: ErrorResponse = { message: 'Please enter a valid email address format.' };
            return json(errorResponse, { status: 400 });
        }

        // Basic validation for required fields (as per your form's requirements)
        if (!name || !addressCity || !addressState) {
            const errorResponse: ErrorResponse = { message: 'Name, City, and State are required fields.' };
            return json(errorResponse, { status: 400 });
        }
        // --- End Server-side Validation ---


        console.log('[API] Starting database operations...');

        try {
            const token = uuidv4(); // Generate a unique token for confirmation
            console.log(`[API] Generated token for ${email}`);

            console.log('[API] Executing database query...');
            const result = await db.query(
                `INSERT INTO subscribers(
                    email, status, confirmation_token,
                    name, phone, address_city, address_state, message
                )
                VALUES($1, 'pending', $2, $3, $4, $5, $6, $7)
                ON CONFLICT (email) DO UPDATE SET
                    confirmation_token = EXCLUDED.confirmation_token,
                    status = CASE
                                WHEN subscribers.status = 'unsubscribed' THEN 'pending'
                                ELSE subscribers.status
                            END,
                    name = EXCLUDED.name,
                    phone = EXCLUDED.phone,
                    address_city = EXCLUDED.address_city,
                    address_state = EXCLUDED.address_state,
                    message = EXCLUDED.message
                RETURNING id, status, email`, // Ensure 'email' is returned for sendConfirmationEmail
                [email, token, name, phone, addressCity, addressState, message]
            );

            console.log(`[API] Database query completed. Row count: ${result.rowCount}`);

            if (result.rowCount && result.rowCount > 0) {
                const subscriberStatus: SubscriberStatus = result.rows[0]?.status;
                const subscriberEmail: string = result.rows[0]?.email;
                // The 'name' variable already holds the full name from the requestBody.
                // Pass it directly to sendConfirmationEmail.
                const subscriberName: string = name;

                console.log(`[API] Subscriber status: ${subscriberStatus} for ${subscriberEmail}`);

                if (subscriberStatus === 'confirmed') {
                    console.log(`[API] Email already confirmed: ${subscriberEmail}`);
                    const successResponse: SubscriptionResponse = { message: 'You are already subscribed and confirmed!' };
                    return json(successResponse, { status: 200 });
                } else {
                    console.log(`[API] Attempting to send confirmation email to: ${subscriberEmail}`);
                    try {
                        // Pass the 'name' variable directly as the 'name' parameter
                        await sendConfirmationEmail({ to: subscriberEmail, name: subscriberName, token: token });
                        console.log(`Successfully processed subscription for (pending confirmation): ${subscriberEmail}`);
                        const successResponse: SubscriptionResponse = { message: 'Please check your email to confirm your subscription!' };
                        return json(successResponse, { status: 200 });
                    } catch (emailSendError: unknown) {
                        console.error('Failed to send confirmation email:', emailSendError);
                        // Even if email fails, acknowledge subscription was saved
                        const successResponse: SubscriptionResponse = { message: 'Subscription saved! Please check your email or contact support if you don\'t receive confirmation.' };
                        return json(successResponse, { status: 200 });
                    }
                }
            } else {
                console.error(`[API] Database query returned no rows for: ${email}`);
                const errorResponse: ErrorResponse = { message: 'Failed to process subscription request. Please try again.' };
                return json(errorResponse, { status: 500 });
            }

        } catch (dbError: unknown) {
            console.error('[API] Database error:', dbError);
            if (dbError instanceof Error) {
                console.error('[API] Database error details:', {
                    message: dbError.message,
                    stack: dbError.stack
                });
            }
            const errorResponse: ErrorResponse = { message: 'Database error occurred. Please try again later.' };
            return json(errorResponse, { status: 500 });
        }

    } catch (apiError: unknown) {
        console.error('[API] Top-level API error:', apiError);
        if (apiError instanceof Error) {
            console.error('[API] API error details:', {
                message: apiError.message,
                stack: apiError.stack
            });
        }
        const errorResponse: ErrorResponse = { message: 'Internal server error occurred.' };
        return json(errorResponse, { status: 500 });
    }
};