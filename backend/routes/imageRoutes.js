const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const upload = require('../middleware/upload');

// Upload image
router.post('/upload', upload.single('image'), imageController.uploadImage);

// Get all images
router.get('/', imageController.getAllImages);

// Delete image
router.delete('/:id', imageController.deleteImage);

module.exports = router;