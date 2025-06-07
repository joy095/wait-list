// src/lib/server/email.ts
import nodemailer from 'nodemailer';
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
});

const FROM_EMAIL = env.SMTP_USERNAME;

export async function sendConfirmationEmail({ to, name, token }: { to: string; name: string; token: string }) {
    if (!env.SMTP_USERNAME || !env.SMTP_PASSWORD) {
        console.error('Email sending skipped: SMTP credentials not configured.');
        throw new Error('Email service not configured.');
    }

    const confirmationLink = `${env.BASE_URL}/confirm-email?token=${token}`; // Updated path to /confirm-email

    const currentYear = new Date().getFullYear();
    const companyName = "Your Company Name"; // Define your company name

    try {
        const info = await transporter.sendMail({
            from: FROM_EMAIL,
            to: to,
            subject: `Almost There! Confirm Your Subscription to ${companyName}`,
            html: `
                <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f6; padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                        <tr>
                            <td style="padding: 30px 40px; text-align: center;">
                                <h1 style="font-size: 28px; color: #6a0dad; margin-bottom: 20px;">Welcome ${name || 'Aboard!'}!</h1>
                                <p style="font-size: 16px; margin-bottom: 15px;">A warm welcome from the ${companyName} team! 🎉</p>
                                <p style="font-size: 16px; margin-bottom: 25px;">Thank you for taking the first step to stay connected. We're thrilled to have you join our community and look forward to sharing:</p>
                                <p style="font-size: 16px; margin-bottom: 30px;">To activate your subscription and start receiving these exciting updates, please click the button below:</p>
                                <a href="${confirmationLink}" style="display: inline-block; background-color: #6a0dad; color: #ffffff; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px rgba(106, 0, 173, 0.2);">
                                    Confirm My Subscription
                                </a>
                                <p style="font-size: 14px; color: #777; margin-top: 30px;">If you didn't sign up for this mailing list, please ignore this email. No further action is needed.</p>
                                <p style="font-size: 16px; color: #333; margin-top: 25px;">Best regards,<br>${companyName} Team</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 40px; text-align: center; font-size: 13px; color: #999; border-top: 1px solid #eee;">
                                <p>&copy; ${currentYear} ${companyName}. All rights reserved.</p>
                                <p style="margin-top: 5px;">Made with &#x2764;&#xfe0f; by Our Team</p>
                            </td>
                        </tr>
                    </table>
                </div>
            `,
            text: `Subject: Almost There! Confirm Your Subscription to ${companyName}\n\n` +
                `Hello ${name || 'Subscriber'},\n\n` +
                `A warm welcome from the ${companyName} team! 🎉\n\n` +
                `Thank you for taking the first step to stay connected. We're thrilled to have you join our community and look forward to sharing:\n\n` +
                `To activate your subscription and start receiving these exciting updates, please click the link below:\n\n` +
                `${confirmationLink}\n\n` +
                `If you didn't sign up for this mailing list, please ignore this email. No further action is needed.\n\n` +
                `Best regards,\n` +
                `${companyName} Team\n\n` +
                `---\n` +
                `© ${currentYear} ${companyName}. All rights reserved.\n` +
                `Made with ❤️ by Our Team`
        });

        console.log('[Email Service] Email sent successfully. Message ID:', info.messageId);
        return info;
    } catch (error: any) {
        console.error('[Email Service] Error sending email:', error);
        if (error.response) {
            console.error('[Email Service] SMTP Response:', error.response);
        }
        throw error;
    }
}