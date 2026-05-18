import rateLimit from 'express-rate-limit';

// Throttles brute-force attempts on authentication / password endpoints
// (login, register, admin login, forgot/reset password).
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 40,                  // per IP per window — generous for real users
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});

export default authLimiter;
