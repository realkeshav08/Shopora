import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({ success: false, message: 'Not Authorized, please login again' })
    }
    try {
        const token_decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = token_decoded.id;
        next()
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: 'Session expired, please login again' })
    }
}

export default authUser;
