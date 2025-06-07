// src/routes/confirm-email/+page.server.ts
import db from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
    const token = url.searchParams.get('token');
    const statusParam = url.searchParams.get('status');

    // If there's a status param, it means we're coming from a redirect (already handled)
    // We just return the status to the client-side component to display.
    if (statusParam) {
        return {
            status: statusParam,
            message: null // Message will be set by the client-side component based on status
        };
    }

    // If no status param, then we expect a token for verification
    if (!token) {
        error(400, 'Verification token is missing. Please check your email for the correct link.');
    }

    try {
        // Find user by token and check expiry
        const result = await db.query(
            `SELECT id, email, email_verified, token_expires_at, subscription_status FROM users WHERE verification_token = $1;`,
            [token]
        );

        const user = result.rows[0];

        if (!user) {
            error(404, 'Invalid verification token. It might be incorrect or already used.');
        }

        if (user.email_verified && user.subscription_status === 'subscribed') {
            // Already verified and subscribed, redirect to an "already verified" state
            redirect(303, '/confirm-email?status=already_subscribed');
        }

        if (user.token_expires_at && new Date() > new Date(user.token_expires_at)) {
            // Token expired, redirect to an "expired" state
            error(400, 'Verification link has expired. Please sign up again to receive a new link.');
        }

        // Verify the user's email and set subscription status to 'subscribed'
        await db.query(
            `UPDATE users SET email_verified = TRUE, verification_token = NULL, token_expires_at = NULL, subscription_status = 'subscribed' WHERE id = $1;`,
            [user.id]
        );

        // Success: Redirect to a success state
        redirect(303, '/confirm-email?status=success');

    } catch (err: any) {
        console.error('Error during email confirmation:', err);
        // If it's a SvelteKit `error` or `redirect`, re-throw it so SvelteKit handles it
        if (err.status) throw err;
        // For other unexpected errors
        error(500, 'An unexpected server error occurred during email confirmation.');
    }
};