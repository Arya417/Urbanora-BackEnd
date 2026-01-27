const express = require('express');
const router = express.Router();
const Wishlist = require('../db/models/wishlist-schema');
const Products = require('../db/models/product-schema');
const mongoose = require('mongoose');

router.post('/wishlist', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId)
      return res.status(400).json({ message: 'Missing required fields' });

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [{ productId }] });
    } else {
      const exists = wishlist.items.some(
        item => item.productId.toString() === productId
      );
      if (exists)
        return res.status(200).json({ message: 'Already in wishlist ❤️' });

      wishlist.items.push({ productId });
    }

    await wishlist.save();
    res.status(200).json({ message: 'Added to wishlist successfully ❤️' });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ message: 'Server error while adding to wishlist' });
  }
});

router.get('/wishlist/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await Wishlist.findOne({ userId }).populate(
      'items.productId'
    );

    if (!wishlist) return res.json({ items: [] });
    res.json(wishlist);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ message: 'Server error while fetching wishlist' });
  }
});

router.delete('/wishlist/remove', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: 'userId and productId required' });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const before = wishlist.items.length;

    wishlist.items = wishlist.items.filter(
      item => item.productId.toString() !== productId.toString()
    );

    if (wishlist.items.length === before) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    await wishlist.save();

    return res.status(200).json({ message: 'Item removed successfully' });
  } catch (err) {
    console.error('❌ Error removing item:', err);
    return res
      .status(500)
      .json({ message: 'Server error', error: err.message });
  }
});

router.post('/wishlist/move-to-bag', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    await Wishlist.updateOne(
      { userId: mongoose.Types.ObjectId(userId) },
      { $pull: { items: { productId: mongoose.Types.ObjectId(productId) } } }
    );

    res.status(200).json({ message: 'Moved to bag successfully' });
  } catch (err) {
    console.error('Error moving to bag:', err);
    res.status(500).json({ message: 'Server error while moving to bag' });
  }
});

module.exports = router;
