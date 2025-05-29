import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    address: {
        firstName: String,
        lastName: String,
        email: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
        phone: String,
    },
    items: [
        {
            _id: String,
            name: String,
            description: String,
            price: Number,
            image: String,
            category: String,
            quantity: Number,
        },
    ],
    amount: { type: Number, required: true }, // Stored in paise
    orderId: { type: String, required: true }, // Razorpay order ID
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' },  // Added field for order status
});

const OrderModel = mongoose.model("Order", OrderSchema);
export default OrderModel;