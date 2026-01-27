const express = require('express');
const router = express.Router();
const Cart = require('../db/models/add-cart-schema');
const Product = require('../db/models/product-schema');

//  Add to Cart
router.post('/add-to-cart', async (req, res) => {
  try {
    const { userId, productId, quantity, size } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], totalAmount: 0 });
    }

    const existingItem = cart.items.find(
      item => item.productId.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.priceAtAddTime = product.price; //  update to latest price
    } else {
      cart.items.push({
        productId,
        quantity,
        size,
        priceAtAddTime: product.price, //  use correct current price
      });
    }

    // ✅ Recalculate total safely
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * (item.priceAtAddTime || 0),
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🛒 Get User Cart — ✅ Returns fresh prices + total
router.get('/add-to-cart/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate(
      'items.productId'
    );

    if (!cart || cart.items.length === 0)
      return res
        .status(200)
        .json({ userId: req.params.userId, items: [], totalAmount: 0 });

    // ✅ Update total dynamically using current product prices
    let totalAmount = 0;
    const updatedItems = cart.items.map(item => {
      const product = item.productId;
      const latestPrice = product ? product.price : item.priceAtAddTime || 0;
      const itemTotal = latestPrice * item.quantity;
      totalAmount += itemTotal;

      return {
        _id: item._id,
        productId: product?._id,
        name: product?.name,
        description: product?.description,
        image: product?.image,
        quantity: item.quantity,
        size: item.size,
        priceAtAddTime: latestPrice,
      };
    });

    cart.totalAmount = totalAmount;
    await cart.save();

    res.status(200).json({
      userId: cart.userId,
      items: updatedItems,
      totalAmount,
    });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🗑️ Remove Item
router.delete('/add-to-cart/:userId/:cartItemId', async (req, res) => {
  try {
    const { userId, cartItemId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item._id.toString() !== cartItemId);

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * (item.priceAtAddTime || 0),
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error removing item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✏️ Update Quantity
router.put('/add-to-cart/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.productId._id.toString() === productId);
    if (item) {
      item.quantity = quantity;
      item.priceAtAddTime = item.productId.price; // ✅ update price
    }

    cart.totalAmount = cart.items.reduce(
      (sum, i) => sum + i.quantity * (i.priceAtAddTime || 0),
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error('Update quantity error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🧹 CLEAR CART — FINAL FIX (GET METHOD + CORRECT URL)
router.get('/add-to-cart/clear/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        totalAmount: 0,
      });
    } else {
      cart.items = [];
      cart.totalAmount = 0;
    }

    await cart.save();

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ message: 'Server error while clearing cart' });
  }
});

module.exports = router;
