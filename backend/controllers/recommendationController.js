// Recommendation controllers.
//
// The recommendation model lives in the Python FastAPI service
// (see /recommendation-service). These handlers are thin proxies: they forward
// the request to that service and return its response unchanged. Auth is still
// enforced here by the route middleware (authUser / adminAuth).

const SERVICE_URL = (process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '')

// Raised for malformed requests (HTTP 4xx) so the proxy can report them
// distinctly from a genuine service outage.
class BadRequestError extends Error {}

// Call the Python recommendation service and return its parsed JSON.
const callService = async (path, { method = 'GET', body } = {}) => {
    const headers = { 'Content-Type': 'application/json' }
    // Shared secret so only this backend can call the internal service.
    if (process.env.RECO_SERVICE_KEY) {
        headers['x-internal-key'] = process.env.RECO_SERVICE_KEY
    }
    const res = await fetch(`${SERVICE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status >= 400 && res.status < 500) {
        throw new BadRequestError(`Invalid recommendation request (${res.status})`)
    }
    if (!res.ok) {
        throw new Error(`Recommendation service responded with ${res.status}`)
    }
    return res.json()
}

// Wraps a proxy call so a service outage degrades gracefully instead of crashing.
const proxy = (handler) => async (req, res) => {
    try {
        const data = await handler(req)
        res.json(data)
    } catch (error) {
        if (error instanceof BadRequestError) {
            return res.json({ success: false, message: 'Invalid request' })
        }
        console.log('[recommendations] service error:', error.message)
        res.json({ success: false, message: 'Recommendation service unavailable' })
    }
}

// Content-based: similar products by category, subCategory, and price range.
const getSimilarProducts = proxy((req) =>
    callService('/similar', { method: 'POST', body: { productId: req.body.productId } })
)

// Collaborative: products frequently bought together (order co-occurrence).
const getFrequentlyBoughtTogether = proxy((req) =>
    callService('/bought-together', { method: 'POST', body: { productId: req.body.productId } })
)

// Personalized: based on the authenticated user's purchase history.
// `req.userId` is set by the authUser middleware.
const getPersonalized = proxy((req) =>
    callService('/personalized', { method: 'POST', body: { userId: req.userId } })
)

// Trending: most ordered products in the last 30 days.
const getTrending = proxy(() => callService('/trending'))

// Admin analytics: top product pairs bought together.
const getCoPurchaseAnalytics = proxy(() => callService('/analytics/copurchase'))

// Admin analytics: trending products with order counts.
const getTrendingAnalytics = proxy(() => callService('/analytics/trending'))

export { getSimilarProducts, getFrequentlyBoughtTogether, getPersonalized, getTrending, getCoPurchaseAnalytics, getTrendingAnalytics }
