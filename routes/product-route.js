const express = require('express');
const router = express.Router();
const Product = require('../db/models/product-schema');

// router.get('/', async (req, res) => {
//   try {
//     const { gender, maxPrice, colors, category, subcategory, search } =
//       req.query;
//     let filters = {};

//     if (gender) filters.audience = gender;

//     if (category) filters.category = { $regex: `^${category}$`, $options: 'i' };

//     if (subcategory)
//       filters.subCategory = { $regex: `^${subcategory}$`, $options: 'i' };

//     if (maxPrice) filters.price = { $lte: Number(maxPrice) };

//     if (colors) {
//       const colorArray = colors.split(',').map(c => c.trim());
//       filters['attributes.color'] = { $in: colorArray };
//     }

//     if (search) {
//       const regex = new RegExp(search, 'i');
//       filters.$or = [
//         { name: regex },
//         { description: regex },
//         { category: regex },
//         { subCategory: regex },
//       ];
//     }

//     const products = await Product.find(filters);
//     res.status(200).json(products);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


router.get('/', async (req, res) => {
  try {
    const {
      gender,
      maxPrice,
      colors,
      category,
      subcategory,
      search,
      page = 1,
      limit = 8,
    } = req.query;

    let filters = {};

    if (gender) filters.audience = gender;
    if (category) filters.category = { $regex: `^${category}$`, $options: 'i' };
    if (subcategory)
      filters.subCategory = { $regex: `^${subcategory}$`, $options: 'i' };
    if (maxPrice) filters.price = { $lte: Number(maxPrice) };
    if (colors) {
      const colorArray = colors.split(',').map(c => c.trim());
      filters['attributes.color'] = { $in: colorArray };
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      filters.$or = [
        { name: regex },
        { description: regex },
        { category: regex },
        { subCategory: regex },
      ];
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filters)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filters);

    res.status(200).json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



router.post('/', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res
      .status(201)
      .json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const products = await Product.find({ userId });
    res.json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//

router.patch('/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.userId !== userId) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to update this product' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ message: '✅ Product updated', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;

    const product = await Product.findById(req.params.id);
    console.log(product);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    console.log(userId, product.userId);
    if (product.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
