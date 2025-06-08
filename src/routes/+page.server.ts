// src/routes/+page.server.ts

import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import db from '$lib/server/db'; // Assuming your db connection setup
import { sendConfirmationEmail } from '$lib/server/email'; // Your email sending utility

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
    }),
    // Schema for Makeup Customers
    baseSchema.extend({
        userType: z.literal("customer_makeup"),
        makeupOccasions: z.array(z.string()).min(1, "Please select at least one occasion."),
        importantFactors: z.array(z.string()).min(1, "Please select at least one factor."),
        bookingFrustrations: z.string().optional(),
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


export const actions = {
    submitForm: async ({ request }) => {
        const formData = await request.formData();
        const data = {
            ...Object.fromEntries(formData),
            barberServices: formData.getAll('barberServices'),
            makeupOccasions: formData.getAll('makeupOccasions'),
            importantFactors: formData.getAll('importantFactors')
        };

        const validated = formSchema.safeParse(data);

        if (!validated.success) {
            const firstError = Object.values(validated.error.flatten().fieldErrors).flat()[0] || 'Invalid data.';
            return fail(400, { message: firstError, data });
        }

        const { firstName, lastName, email, userType } = validated.data;

        try {
            // Check for existing user (simplified from your original code)
            const existingUser = await db.query('SELECT email FROM tests WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return fail(409, { message: 'This email is already registered. Thank you!' });
            }

            const verificationToken = randomBytes(32).toString('hex');
            const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Insert data based on user type
            if (userType === 'customer_barber') {
                const { visitFrequency, barberServices, importantFactors, bookingFrustrations } = validated.data;
                await db.query(
                    `INSERT INTO tests (first_name, last_name, email, user_type, visit_frequency, barber_services, barber_choice_factors, booking_frustrations, verification_token, token_expires_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [firstName, lastName, email, userType, visitFrequency, barberServices, importantFactors, bookingFrustrations, verificationToken, tokenExpiresAt]
                );
            } else if (userType === 'customer_makeup') {
                const { makeupOccasions, importantFactors, bookingFrustrations } = validated.data;
                await db.query(
                    `INSERT INTO tests (first_name, last_name, email, user_type, makeup_occasions, makeup_artist_choice_factors, booking_frustrations, verification_token, token_expires_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [firstName, lastName, email, userType, makeupOccasions, importantFactors, bookingFrustrations, verificationToken, tokenExpiresAt]
                );
            } else if (userType === 'owner_barber' || userType === 'owner_makeup') {
                const { commissionPreference, biggestChallenges } = validated.data;
                let discountInterest = null;
                let portfolioInterest = null;
                if ('offerDiscounts' in validated.data) discountInterest = validated.data.offerDiscounts;
                if ('portfolioInterest' in validated.data) portfolioInterest = validated.data.portfolioInterest;

                await db.query(
                    `INSERT INTO tests (first_name, last_name, email, user_type, commission_preference, discount_interest, portfolio_interest, biggest_challenges, verification_token, token_expires_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [firstName, lastName, email, userType, commissionPreference, discountInterest, portfolioInterest, biggestChallenges, verificationToken, tokenExpiresAt]
                );
            }
            // Add other 'else if' blocks for other user types as needed

            await sendConfirmationEmail({ to: email, name: firstName, token: verificationToken });

            return { type: 'success' };

        } catch (error) {
            console.error('Form submission error:', error);
            return fail(500, { message: 'An internal server error occurred. Please try again.' });
        }
    }
};