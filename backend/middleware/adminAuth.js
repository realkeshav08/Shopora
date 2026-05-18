import jwt from 'jsonwebtoken'

// Authorises admin-only routes. Accepts any valid, non-expired token whose
// payload carries role: 'admin' — covers both the master .env admin and
// database admin users.
const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({ success: false, message: "Not Authorized, please login again" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded || decoded.role !== 'admin') {
            return res.json({ success: false, message: "Not Authorized, please login again" })
        }
        next()
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: "Not Authorized, please login again" })
    }
}

export default adminAuth
