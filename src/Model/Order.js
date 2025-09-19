const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cartItems: [
    {
      title: String,
      variant: String,
      prize: Number,
      quantity: Number,
    },
  ],
    role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"   // 🔑 all new users automatically get role = "user"
  },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
