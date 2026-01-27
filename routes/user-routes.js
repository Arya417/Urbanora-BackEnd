const express = require('express');
const User = require('../db/models/user-schema');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcrypt');
let nodemailer = require('nodemailer');

router.get('/user', async (req, res) => {
  try {
    const dbResponse = await User.find();
    return res.status(200).json(dbResponse);
  } catch (e) {
    return res.status(500).json({ message: e.message, error: true });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dbResponse = await User.findById(id);
    return res.status(200).json(dbResponse);
  } catch (e) {
    return res.status(500).json({ message: e.message, error: true });
  }
});

router.post('/user', async (req, res) => {
  try {
    const { body } = req;
    const dbResponse = await User.create(body);
    return res.status(201).json(dbResponse);
  } catch (e) {
    return res.status(500).json({ message: e.message, error: true });
  }
});

router.post('/user/sign-up', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'email already taken' });
    }

    if (password != confirmPassword) {
      return res.status(400).json({ message: "password doesn't match" });
    }

    const hashedPassword = await bcrypt.hash(password, 2);
    const dbResponse = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    return res.status(200).json({ message: 'Account created' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Email or Password is incorrect' });
    }

    const isMatching = await bcrypt.compare(password, user.password);
    if (!isMatching) {
      return res
        .status(400)
        .json({ message: 'Email or Password is incorrect' });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: '14d',
    });

    return res.status(200).json({
      message: 'Logged In',
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/user/:userId/address', async (req, res) => {
  try {
    const { userId } = req.params;
    const addressData = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.address.push(addressData);

    await user.save();

    return res
      .status(200)
      .json({ message: 'Address added successfully', address: user.address });
  } catch (err) {
    console.error('Error adding address:', err);
    return res
      .status(500)
      .json({ message: 'Error adding address', error: err.message });
  }
});

router.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return res.status(200).json(updatedUser);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.delete('/user/:userId/address/:index', async (req, res) => {
  try {
    const { userId, index } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.address.splice(index, 1);
    await user.save();

    res.status(200).json({ message: 'Address deleted', address: user.address });
  } catch (err) {
    console.error('Error deleting address:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
