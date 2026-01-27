

const express = require('express');
const multer = require('multer');
const uniqid = require('uniqid');
const path = require('path');

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images')); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uniqid()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });


router.post('/upload-image', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const imageUrls = req.files.map(
      file => `http://localhost:8000/images/${file.filename}`
    );

    return res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      urls: imageUrls,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
