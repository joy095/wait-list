// src/routes/api/contact/+server.ts
import nodemailer from 'nodemailer';
import { json } from '@sveltejs/kit';

// IMPORTANT: Ensure your .env file has variables prefixed with VITE_, like:
// VITE_SMTP_HOST="your_smtp_host" (e.g., "smtp.gmail.com")
// VITE_SMTP_PORT="587" (or "465" for SSL)
// VITE_SMTP_USER="your_email@example.com"
// VITE_SMTP_PASS="your_app_password_or_email_password"

// Get environment variables
const SMTP_HOST = import.meta.env.VITE_SMTP_HOST;
const SMTP_PORT = parseInt(import.meta.env.VITE_SMTP_PORT || '587', 10);
const SMTP_USER = import.meta.env.VITE_SMTP_USERNAME;
const SMTP_PASS = import.meta.env.VITE_SMTP_PASSWORD;

// Only log configuration in development
if (process.env.NODE_ENV === 'development') {
    console.log('Nodemailer Config:');
    console.log('  Host:', SMTP_HOST);
    console.log('  Port:', SMTP_PORT);
    console.log('  User:', SMTP_USER);
    console.log('  Secure (SSL/TLS):', SMTP_PORT === 465);
}


const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // Use true for 465 (SSL), false for other ports (TLS)
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

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
            from: SMTP_USER, // Sender address (should typically match SMTP_USER for authentication)
            to: SMTP_USER,   // Recipient address (can be your business email, e.g., 'your_business_email@example.com')
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