import express from 'express'
import {
    getSimilarProducts,
    getFrequentlyBoughtTogether,
    getPersonalized,
    getTrending,
    getCoPurchaseAnalytics,
    getTrendingAnalytics
} from '../controllers/recommendationController.js'
import authUser from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'

const recommendationRouter = express.Router()

recommendationRouter.post('/similar', getSimilarProducts)
recommendationRouter.post('/bought-together', getFrequentlyBoughtTogether)
recommendationRouter.post('/personalized', authUser, getPersonalized)
recommendationRouter.get('/trending', getTrending)
recommendationRouter.get('/analytics/trending', adminAuth, getTrendingAnalytics)
recommendationRouter.get('/analytics/copurchase', adminAuth, getCoPurchaseAnalytics)

export default recommendationRouter
