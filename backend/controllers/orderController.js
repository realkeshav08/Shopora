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
        // current product prices in the database.
        let subtotal = 0
        for (const item of items) {
            const product = await productModel.findById(item._id || item.id).catch(() => null)
            if (product) {
                subtotal += product.price * (Number(item.quantity) || 1)
            }
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
        res.json({success: true, message: "Order Status Updated"})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: "Something went wrong. Please try again later."})
    }
}

export {placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, updateStatus, userOrders}