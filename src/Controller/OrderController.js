const Order = require("../Model/Order");
const User = require("../Model/UserModel"); // Import your User model

// Place an order
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.userId; // token decoded userId
    if (!userId) {
      return res.status(400).send({ status: false, msg: "id must be present" });
    }

    const { cartItems, totalPrice } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ status: false, msg: "Cart is empty" });
    }

    // Create order
    const order = new Order({
      user: userId,
      cartItems: cartItems.map((item) => ({
        title: item.title1 || item.title,
        variant: item.variant,
        prize: parseFloat(
          typeof item.prize === "string"
            ? item.prize.replace(/[^0-9.]/g, "")
            : item.prize
        ),
        quantity: item.quantity,
      })),
      totalPrice,
    });

    await order.save();

    // Populate user details
    const orderWithUser = await Order.findById(order._id)
      .populate("user", "name email"); // Only get name and email

    res.status(201).json({
      success: true,
      message: "Order placed",
      order: orderWithUser
    });
  } catch (error) {
    console.error("Order save error:", error.message);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get all orders error:", error.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};