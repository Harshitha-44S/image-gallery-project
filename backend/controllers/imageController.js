const Image = require('../models/Image');
const s3 = require('../config/aws');
const { v4: uuidv4 } = require('uuid');

// Upload image to S3 and save metadata
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const { description, tags } = req.body;

    // Generate unique filename for S3
    const fileExtension = file.originalname.split('.').pop();
    const s3Key = `images/${uuidv4()}.${fileExtension}`;

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const s3Upload = await s3.upload(uploadParams).promise();

    // Save to database
    const image = new Image({
      filename: file.originalname,
      originalName: file.originalname,
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      fileSize: file.size,
      fileType: file.mimetype,
      s3Key: s3Key,
      s3Url: s3Upload.Location
    });

    await image.save();

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: {
        id: image._id,
        filename: image.filename,
        description: image.description,
        tags: image.tags,
        url: image.s3Url,
        uploadDate: image.uploadDate
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

// Get all images
exports.getAllImages = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { filename: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      };
    }

    const images = await Image.find(query).sort({ uploadDate: -1 });
    res.json(images);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from S3
    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: image.s3Key
    }).promise();

    // Delete from database
    await Image.findByIdAndDelete(id);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};