import 'dotenv/config';

// Email is sent via the Resend HTTP API (https), NOT SMTP.
//
// Hosting platforms like Render block outbound SMTP (ports 25/465/587) as an
// anti-spam measure, so nodemailer/Gmail-SMTP hangs in production. The Resend
// API works over port 443, so it is unaffected.
//
// Required env var: RESEND_API_KEY (from the Resend dashboard).

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// The "From" address must be on a domain verified in Resend.
// keshavkashyap.me is verified, so any address on it works.
const mailFrom = process.env.MAIL_FROM || 'Shopora <shopora@keshavkashyap.me>';
const mailReplyTo = process.env.MAIL_REPLY_TO || process.env.SENDER_EMAIL;

/**
 * Send an email through Resend. Resolves quickly (HTTPS request); throws on
 * an API error so callers can handle failure. If RESEND_API_KEY is missing it
 * logs and skips rather than throwing.
 */
const sendMail = async ({ to, subject, html, text }) => {
    if (!RESEND_API_KEY) {
        console.log('[mailer] RESEND_API_KEY not set — email skipped:', subject);
        return { skipped: true };
    }

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: mailFrom,
            reply_to: mailReplyTo,
            to: Array.isArray(to) ? to : [to],
            subject,
            ...(html ? { html } : {}),
            ...(text ? { text } : {}),
        }),
    });

    if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Resend API ${res.status}: ${detail}`);
    }
    return res.json();
};

export { sendMail, mailFrom, mailReplyTo };
