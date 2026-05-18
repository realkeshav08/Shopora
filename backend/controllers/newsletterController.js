import { sendMail } from '../config/mailer.js';
import newsletterModel from "../models/newsletterModel.js";

const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        // Save to database
        const exists = await newsletterModel.findOne({ email });
        if (exists) {
            return res.json({ success: true, message: "You are already subscribed to our newsletter!" });
        }

        const newSubscriber = new newsletterModel({
            email,
            date: Date.now()
        });
        await newSubscriber.save();

        const welcomeHtml = `
            <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
                <h2 style="color: #ed4293; text-align: center;">Welcome to Shopora!</h2>
                <p>Hi there,</p>
                <p>Thank you for subscribing to our newsletter. We're excited to have you in the loop!</p>
                <p>Stay tuned for updates on our latest collections, exclusive offers, and style tips tailored just for you.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://shopora.keshavkashyap.me" style="background-color: #ed4293; color: white; padding: 12px 25px; text-decoration: none; border-radius: 10px; font-weight: bold;">Visit Our Store</a>
                </div>
                <p style="margin-top: 40px; font-size: 0.8em; color: #777; text-align: center;">
                    You received this email because you subscribed to the Shopora newsletter.<br>
                    Shopora © 2026
                </p>
            </div>
        `;

        try {
            await sendMail({ to: email, subject: 'Welcome to Shopora Newsletter!', html: welcomeHtml });
            res.json({ success: true, message: "Subscription successful! Welcome email sent." });
        } catch (sendError) {
            console.log("Email sending failed:", sendError.message);
            // The subscription is saved regardless of email delivery.
            res.json({ success: true, message: "Subscription successful!" });
        }

    } catch (error) {
        console.log("Newsletter Controller Error:", error);
        res.json({ success: false, message: "An unexpected error occurred." });
    }
};

export { subscribeNewsletter };
