import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"

const DELIVERY_FEE = 10

const placeOrder = async (req, res) => {
    try {
        const { userId } = req;
        const { items, address } = req.body

        if (!Array.isArray(items) || items.length === 0) {
            return res.json({ success: false, message: "Your cart is empty" })
        }
        if (!address || typeof address !== 'object') {
            return res.json({ success: false, message: "Delivery address is required" })
        }

        // Never trust a client-supplied total — recompute the amount from the
        // current product prices in the database, and reject anything that is
        // no longer available (e.g. an admin marked it out of stock).
        let subtotal = 0
        const unavailable = []
        for (const item of items) {
            const product = await productModel.findById(item._id || item.id).catch(() => null)
            if (!product) continue
            // Reject if the product is off, or this specific size is out of stock.
            if (product.available === false || (product.outOfStockSizes || []).includes(item.size)) {
                unavailable.push(`${product.name}${item.size ? ` (${item.size})` : ''}`)
                continue
            }
            subtotal += product.price * (Number(item.quantity) || 1)
        }
        if (unavailable.length > 0) {
            return res.json({
                success: false,
                message: `Out of stock: ${unavailable.join(', ')}. Please remove these items to continue.`
            })
        }
        if (subtotal <= 0) {
            return res.json({ success: false, message: "Could not verify the order items" })
        }
        const amount = subtotal + DELIVERY_FEE

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, {cartData: {}})

        // Real-time: notify the admin panel of the new order.
        req.app.get('io')?.emit('orders:updated')

        res.json({success: true, message: "Order Placed"})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: "Something went wrong. Please try again later."})
    }
}

// Placing orders using stripe method
const placeOrderStripe = async (req, res) => {

}

// Placing orders using Razorpay method
const placeOrderRazorpay = async (req, res) => {

}

// All orders data for admin panel
const allOrders = async (req, res) => {
    try{
        const orders = await orderModel.find({})
        res.json({success: true, orders})
    }
    catch(error){
        console.log(error)
        res.json({success: false, message: "Something went wrong. Please try again later."})
    }
}

// User order data for frontend
const userOrders = async (req, res) => {
    try{
        const { userId } = req;
        const orders = await orderModel.find({userId})
        res.json({success: true, orders})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: "Something went wrong. Please try again later."})
    }
}

// Update order status
const updateStatus = async (req, res) => {
    try{
        const {orderId, status} = req.body
        await orderModel.findByIdAndUpdate(orderId, {status})
        // Real-time: notify the customer's order page + admin of the change.
        req.app.get('io')?.emit('orders:updated')
        res.json({success: true, message: "Order Status Updated"})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: "Something went wrong. Please try again later."})
    }
}

export {placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, updateStatus, userOrders}