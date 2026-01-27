const express = require("express");
const router = express.Router();
const Order = require("../db/models/order-schema.js");

// CREATE NEW ORDER
router.post("/order", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.json(order);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ error: "Order failed" });
  }
});

// GET ALL ORDERS OF A USER
router.get("/order/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;
