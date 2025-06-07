// src/routes/api/contact/+server.ts
import nodemailer from 'nodemailer';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private'; // Import for server-side environment variables

// Ensure SMTP credentials are set
if (!env.SMTP_USERNAME || !env.SMTP_PASSWORD) {
    console.error('SMTP credentials are not set. Email sending will fail');
}

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || '587'), // Ensure port is a number
    secure: env.SMTP_PORT === '465', // Use 'true' for port 465 (SSL)
    auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD,
    },
    logger: true,
    debug: true,
})

/**
 * Handles POST requests to send contact form data.
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

        const mailOptions = {
            from: env.SMTP_USERNAME, // Sender address (should typically match SMTP_USER for authentication)
            to: env.SMTP_USERNAME,   // Recipient address (can be your business email, e.g., 'your_business_email@example.com')
            subject: `Wait list Contact Form Submission from ${name}`,
            html: `
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        };

        console.log('Attempting to send email with options:', mailOptions);
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');

        return json({ message: 'Message sent successfully!' }, { status: 200 });

    } catch (error: any) { // Use 'any' for error type to safely access properties
        console.error('Error sending email:', error);
        // Log specific Nodemailer error details if available
        if (error.code) {
            console.error('Nodemailer error code:', error.code);
        }
        if (error.response) {
            console.error('Nodemailer response:', error.response);
        }
        if (error.responseCode) {
            console.error('Nodemailer response code:', error.responseCode);
        }
        return json({ message: 'Failed to send message.' }, { status: 500 });
    }
}