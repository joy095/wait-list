// src/routes/+page.server.ts

import { fail } from '@sveltejs/kit';
import { z } from 'zod'; // A powerful library for schema validation
import { randomBytes } from 'crypto';
import db from '$lib/server/db'; // Assuming your db connection setup
import { sendConfirmationEmail } from '$lib/server/email'; // Your email sending utility
import i18n from '$lib/i18n';

// Define a schema for your form data for robust validation
const formSchema = z.object({
    firstName: z.string().trim().min(1, { message: 'First name is required.' }),
    lastName: z.string().trim().min(1, { message: 'Last name is required.' }),
    email: z.string().trim().email({ message: 'Please enter a valid email address.' }),
    favoriteColor: z.string().min(1, { message: 'Favorite color is required.' }),
    satisfactionLevel: z.coerce.number().min(1).max(10), // Coerce to number
    feedbackNotes: z.string().optional()
});

export const actions = {
    /**
     * Handles the form submission, validation, and user subscription logic.
     */
    submitForm: async ({ request }) => {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);

        // 1. Validate the form data against the schema
        const validated = formSchema.safeParse(data);

        if (!validated.success) {
            // If validation fails, return a 400 Bad Request with the error messages
            const errors = validated.error.flatten().fieldErrors;
            // Return the first error message found
            const firstError = Object.values(errors).flat()[0] || 'Invalid data provided.';
            return fail(400, { message: firstError });
        }

        const { email, firstName, lastName, favoriteColor, satisfactionLevel, feedbackNotes } = validated.data;

        try {
            // 2. Check if the user is already subscribed
            const existingUserResult = await db.query(
                'SELECT email, subscription_status, email_verified FROM users WHERE email = $1',
                [email]
            );

            const existingUser = existingUserResult.rows[0];

            if (existingUser) {
                // If user exists and is fully subscribed, return a conflict error
                if (existingUser.subscription_status === 'subscribed' && existingUser.email_verified) {
                    return fail(409, { message: 'This email is already subscribed. Thank you!' });
                }

                // (Optional but recommended) If user exists but hasn't confirmed their email yet,
                // resend the confirmation email instead of creating a new user.
                // For this example, we will just inform them.
                if (!existingUser.email_verified) {
                    return fail(409, { message: 'You have already signed up. Please check your email to confirm your subscription.' });
                }
            }

            // 3. Create a new user record with a pending status
            const verificationToken = randomBytes(32).toString('hex');
            const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token valid for 24 hours

            await db.query(
                `INSERT INTO users (first_name, last_name, email, favorite_color, satisfaction_level, feedback_notes, verification_token, token_expires_at, subscription_status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
                [firstName, lastName, email, favoriteColor, satisfactionLevel, feedbackNotes, verificationToken, tokenExpiresAt]
            );

            // 4. Send the confirmation email
            await sendConfirmationEmail({
                to: email,
                name: firstName,
                token: verificationToken
            });

            // 5. Return a success message
            return {
                type: 'success',
                message: 'Great! Please check your email to confirm your subscription.'
            };

        } catch (error) {
            console.error('Form submission error:', error);
            // Return a generic server error message
            return fail(500, { message: 'An internal server error occurred. Please try again later.' });
        }
    }
};


export const load = async ({ url }) => {
    const lang = url.searchParams.get('lang') ?? 'en';
    // set language in your i18n store here
    // example:
    i18n.changeLanguage(lang);

    return {
        lang
    };
};