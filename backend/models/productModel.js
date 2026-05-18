import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true},
    price: { type: Number, required: true},
    description: { type: String, required: true },
    images: { type: [String], required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    bestseller : { type: Boolean},
    available: { type: Boolean, default: true },
    // Sizes that are individually out of stock. A size is buyable when the
    // product is available AND its size is not listed here.
    outOfStockSizes: { type: [String], default: [] },
    date: { type: Number, required: true }
})

const productModel =mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;