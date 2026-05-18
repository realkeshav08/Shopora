import 'dotenv/config';
import nodemailer from 'nodemailer';

// Single shared mail transporter for the whole backend.
// Authenticates against the Gmail account in SENDER_EMAIL / EMAIL_PASS
// (EMAIL_PASS must be a Gmail "App Password", not the normal login password).
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

// The "From" header shown to recipients.
//
// Gmail's SMTP only allows sending from the authenticated address OR from an
// address registered under Gmail Settings > Accounts > "Send mail as". Any
// other address gets silently rewritten by Gmail.
//
// So: right now this defaults to the Gmail account. After you deploy and add
// shopora@keshavkashyap.me as a verified "Send mail as" alias, just set
// MAIL_FROM in .env (e.g. MAIL_FROM="Shopora" <shopora@keshavkashyap.me>) —
// no code change needed.
const mailFrom = process.env.MAIL_FROM || `"Shopora" <${process.env.SENDER_EMAIL}>`;

// Where replies and user-initiated contact should land (your inbox).
const mailReplyTo = process.env.MAIL_REPLY_TO || process.env.SENDER_EMAIL;

export { transporter, mailFrom, mailReplyTo };
