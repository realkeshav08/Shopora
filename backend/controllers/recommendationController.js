import mongoose from 'mongoose'
import productModel from '../models/productModel.js'
import orderModel from '../models/orderModel.js'

// Filter out non-ObjectId strings (e.g. fixture data IDs like "aaaab")
const validIds = (ids) => ids.filter(id => id && mongoose.isValidObjectId(id))

const scoreBySimilarity = (candidates, reference) => {
    return candidates.map(p => {
        let score = 0
        if (p.category === reference.category) score += 2
        if (p.subCategory === reference.subCategory) score += 3
        const priceDiff = Math.abs(p.price - reference.price) / (reference.price || 1)
        if (priceDiff <= 0.3) score += 2
        else if (priceDiff <= 0.6) score += 1
        if (p.bestseller) score += 1
        return { ...p.toObject(), score }
    }).sort((a, b) => b.score - a.score)
}

// Content-based: similar products by category, subCategory, and price range
const getSimilarProducts = async (req, res) => {
    try {
        const { productId } = req.body
        if (!mongoose.isValidObjectId(productId)) {
            return res.json({ success: false, message: 'Invalid product ID' })
        }
        const product = await productModel.findById(productId)
        if (!product) return res.json({ success: false, message: 'Product not found' })

        const candidates = await productModel.find({ _id: { $ne: productId }, available: { $ne: false } })
        const scored = scoreBySimilarity(candidates, product)
        res.json({ success: true, products: scored.slice(0, 6) })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Collaborative: products frequently bought together based on order co-occurrence
const getFrequentlyBoughtTogether = async (req, res) => {
    try {
        const { productId } = req.body
        if (!mongoose.isValidObjectId(productId)) {
            return res.json({ success: false, message: 'Invalid product ID' })
        }
        const orders = await orderModel.find({})

        const coOccurrence = {}
        for (const order of orders) {
            const ids = order.items
                .map(item => (item._id || item.id || '').toString())
                .filter(id => id && mongoose.isValidObjectId(id))

            if (!ids.includes(productId)) continue

            for (const id of ids) {
                if (id === productId) continue
                coOccurrence[id] = (coOccurrence[id] || 0) + 1
            }
        }

        const sortedIds = Object.entries(coOccurrence)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([id]) => id)

        if (sortedIds.length < 2) {
            const product = await productModel.findById(productId)
            const fallback = await productModel.find({
                category: product.category,
                _id: { $ne: productId },
                available: { $ne: false }
            }).limit(6)
            return res.json({ success: true, products: fallback, fallback: true })
        }

        const products = await productModel.find({ _id: { $in: sortedIds }, available: { $ne: false } })
        const ordered = sortedIds.map(id => products.find(p => p._id.toString() === id)).filter(Boolean)
        res.json({ success: true, products: ordered })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Personalized: based on the authenticated user's purchase history
const getPersonalized = async (req, res) => {
    try {
        const { userId } = req
        const userOrders = await orderModel.find({ userId })

        if (userOrders.length === 0) {
            const popular = await productModel.find({ bestseller: true, available: { $ne: false } }).limit(8)
            return res.json({ success: true, products: popular, type: 'popular' })
        }

        const purchasedIds = new Set()
        const categoryScore = {}
        const subCategoryScore = {}

        for (const order of userOrders) {
            for (const item of order.items) {
                const id = (item._id || item.id || '').toString()
                if (id && mongoose.isValidObjectId(id)) purchasedIds.add(id)
                if (item.category) categoryScore[item.category] = (categoryScore[item.category] || 0) + 1
                if (item.subCategory) subCategoryScore[item.subCategory] = (subCategoryScore[item.subCategory] || 0) + 1
            }
        }

        const allProducts = await productModel.find({ available: { $ne: false } })
        let scored = allProducts
            .filter(p => !purchasedIds.has(p._id.toString()))
            .map(p => {
                const score = (categoryScore[p.category] || 0) * 2 + (subCategoryScore[p.subCategory] || 0) * 3 + (p.bestseller ? 1 : 0)
                return { ...p.toObject(), score }
            })
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)

        let recommended = scored.slice(0, 8)

        if (recommended.length < 4) {
            const extraIds = validIds([...purchasedIds, ...recommended.map(p => p._id.toString())])
            const extra = await productModel.find({
                bestseller: true,
                available: { $ne: false },
                _id: { $nin: extraIds }
            }).limit(8 - recommended.length)
            recommended = [...recommended, ...extra.map(p => p.toObject())]
        }

        res.json({ success: true, products: recommended, type: 'personalized' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Trending: most ordered products in the last 30 days
const getTrending = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const recentOrders = await orderModel.find({ date: { $gte: thirtyDaysAgo } })

        const productCounts = {}
        for (const order of recentOrders) {
            for (const item of order.items) {
                const id = (item._id || item.id || '').toString()
                if (id && mongoose.isValidObjectId(id)) {
                    productCounts[id] = (productCounts[id] || 0) + (item.quantity || 1)
                }
            }
        }

        const sortedIds = Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([id]) => id)

        if (sortedIds.length < 3) {
            const newProducts = await productModel.find({ available: { $ne: false } })
                .sort({ date: -1 })
                .limit(8)
            return res.json({ success: true, products: newProducts, type: 'new' })
        }

        const products = await productModel.find({ _id: { $in: sortedIds }, available: { $ne: false } })
        const ordered = sortedIds.map(id => products.find(p => p._id.toString() === id)).filter(Boolean)
        res.json({ success: true, products: ordered, type: 'trending' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin analytics: top product pairs bought together
const getCoPurchaseAnalytics = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        const pairCounts = {}

        for (const order of orders) {
            const ids = [...new Set(
                order.items
                    .map(item => (item._id || item.id || '').toString())
                    .filter(id => id && mongoose.isValidObjectId(id))
            )]
            for (let i = 0; i < ids.length; i++) {
                for (let j = i + 1; j < ids.length; j++) {
                    const key = [ids[i], ids[j]].sort().join('|')
                    pairCounts[key] = (pairCounts[key] || 0) + 1
                }
            }
        }

        const topPairs = Object.entries(pairCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)

        const allIds = validIds([...new Set(topPairs.flatMap(([key]) => key.split('|')))])
        const products = await productModel.find({ _id: { $in: allIds } })
        const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]))

        const result = topPairs
            .map(([key, count]) => {
                const [id1, id2] = key.split('|')
                return { product1: productMap[id1] || null, product2: productMap[id2] || null, count }
            })
            .filter(p => p.product1 && p.product2)

        res.json({ success: true, pairs: result })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin analytics: trending products with order counts
const getTrendingAnalytics = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const recentOrders = await orderModel.find({ date: { $gte: thirtyDaysAgo } })

        const productCounts = {}
        for (const order of recentOrders) {
            for (const item of order.items) {
                const id = (item._id || item.id || '').toString()
                if (id && mongoose.isValidObjectId(id)) {
                    productCounts[id] = (productCounts[id] || 0) + (item.quantity || 1)
                }
            }
        }

        const sortedIds = Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)

        const validSortedIds = validIds(sortedIds.map(([id]) => id))
        const products = await productModel.find({ _id: { $in: validSortedIds } })
        const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]))

        const result = sortedIds
            .map(([id, count]) => ({ product: productMap[id] || null, orderCount: count }))
            .filter(r => r.product)

        res.json({ success: true, trending: result, totalOrders: recentOrders.length })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { getSimilarProducts, getFrequentlyBoughtTogether, getPersonalized, getTrending, getCoPurchaseAnalytics, getTrendingAnalytics }
