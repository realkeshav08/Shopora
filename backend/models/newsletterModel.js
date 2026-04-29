import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    date: { type: Number, required: true }
})

const newsletterModel = mongoose.models.newsletter || mongoose.model('newsletter', newsletterSchema);

export default newsletterModel;
