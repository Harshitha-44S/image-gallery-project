const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and your local IP
    if (origin.includes('localhost') || origin.includes('192.168.56.1')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connected!');
  })
  .catch(error => {
    console.log('❌ MongoDB connection failed:', error.message);
  });

// Configure AWS S3 for Backblaze B2
const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT,
  accessKeyId: process.env.B2_KEY_ID,
  secretAccessKey: process.env.B2_APPLICATION_KEY,
  region: process.env.B2_REGION,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Image Schema
const imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  buffer: {
    type: Buffer,
    required: false
  },
  backblazeKey: {
    type: String
  },
  backblazeUrl: {
    type: String
  },
  backblazeBucket: {
    type: String
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const Image = mongoose.model('Image', imageSchema);

// ===== ROUTES =====

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working with MongoDB & Backblaze B2!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    backblaze: {
      bucket: process.env.B2_BUCKET_NAME,
      region: process.env.B2_REGION,
      status: 'Configured'
    },
    timestamp: new Date().toISOString()
  });
});

// Upload image to MongoDB AND Backblaze B2
app.post('/api/images/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded. Please select an image file.' 
      });
    }

    const { description = '', tags = '' } = req.body;
    
    const fileKey = `images/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
    
    console.log('☁️ Uploading to Backblaze B2...');

    // Upload to Backblaze B2 - NO ACL
    const uploadParams = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const backblazeResult = await s3.upload(uploadParams).promise();
    console.log('✅ File uploaded to Backblaze B2:', backblazeResult.Key);

    // Create and save image to MongoDB
    const image = new Image({
      filename: req.file.originalname,
      originalName: req.file.originalname,
      description: description,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      buffer: undefined,
      backblazeKey: backblazeResult.Key,
      backblazeUrl: backblazeResult.Location,
      backblazeBucket: backblazeResult.Bucket
    });

    await image.save();
    console.log('✅ Image saved to MongoDB & Backblaze B2:', image.filename);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully to Backblaze B2!',
      image: {
        _id: image._id,
        filename: image.filename,
        originalName: image.originalName,
        description: image.description,
        tags: image.tags,
        fileSize: image.fileSize,
        fileType: image.fileType,
        uploadDate: image.uploadDate,
        backblazeUrl: image.backblazeUrl,
        backblazeKey: image.backblazeKey
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Upload failed: ' + error.message 
    });
  }
});

// Get all images with signed URLs
app.get('/api/images', async (req, res) => {
  try {
    const { search = '' } = req.query;
    
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

    const images = await Image.find(query).select('-buffer').sort({ uploadDate: -1 });

    // Generate signed URLs for each image
    const imagesWithSignedUrls = await Promise.all(
      images.map(async (image) => {
        const imageObj = image.toObject();
        
        if (image.backblazeKey) {
          try {
            const signedUrl = await s3.getSignedUrlPromise('getObject', {
              Bucket: process.env.B2_BUCKET_NAME,
              Key: image.backblazeKey,
              Expires: 604800 // 7 days
            });
            
            imageObj.signedUrl = signedUrl;
            imageObj.urlExpiry = new Date(Date.now() + 604800 * 1000);
          } catch (error) {
            console.error('Error generating signed URL for:', image.filename);
            imageObj.signedUrl = null;
          }
        }
        
        return imageObj;
      })
    );

    console.log(`📁 Returning ${images.length} images with signed URLs`);
    
    res.json({
      success: true,
      count: images.length,
      images: imagesWithSignedUrls
    });

  } catch (error) {
    console.error('❌ Get images error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch images' 
    });
  }
});

// Serve images from Backblaze B2
app.get('/api/images/file/:id', async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await Image.findById(imageId);
    
    if (!image) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not found' 
      });
    }

    if (image.backblazeUrl) {
      return res.redirect(image.backblazeUrl);
    }

    if (image.buffer) {
      res.set({
        'Content-Type': image.fileType,
        'Content-Length': image.buffer.length,
        'Cache-Control': 'public, max-age=3600'
      });
      return res.send(image.buffer);
    }

    res.status(404).json({ 
      success: false,
      error: 'Image file not available' 
    });
    
  } catch (error) {
    console.error('❌ Serve image error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to serve image' 
    });
  }
});

// Get signed URL for specific image (1 hour expiry)
app.get('/api/images/signed-url/:id', async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await Image.findById(imageId);
    
    if (!image || !image.backblazeKey) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not found' 
      });
    }

    const signedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: image.backblazeKey,
      Expires: 3600 // 1 hour
    });

    res.json({
      success: true,
      signedUrl: signedUrl,
      expiresIn: '1 hour'
    });
    
  } catch (error) {
    console.error('❌ Signed URL error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate signed URL' 
    });
  }
});

// Get signed URL for specific image (7 days expiry)
app.get('/api/images/:id/signed-url', async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await Image.findById(imageId);
    
    if (!image) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not found' 
      });
    }

    if (!image.backblazeKey) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not stored in cloud' 
      });
    }

    const signedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: image.backblazeKey,
      Expires: 604800 // 7 days
    });

    res.json({
      success: true,
      signedUrl: signedUrl,
      expiresAt: new Date(Date.now() + 604800 * 1000),
      filename: image.filename
    });
    
  } catch (error) {
    console.error('❌ Signed URL error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate signed URL: ' + error.message 
    });
  }
});

// Delete image
app.delete('/api/images/:id', async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await Image.findById(imageId);
    
    if (!image) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not found' 
      });
    }

    if (image.backblazeKey) {
      try {
        await s3.deleteObject({
          Bucket: process.env.B2_BUCKET_NAME,
          Key: image.backblazeKey
        }).promise();
        console.log('✅ Image deleted from Backblaze B2:', image.backblazeKey);
      } catch (error) {
        console.error('⚠️ Failed to delete from Backblaze B2:', error.message);
      }
    }

    await Image.findByIdAndDelete(imageId);
    console.log('✅ Image deleted from MongoDB:', image.filename);
    
    res.json({ 
      success: true,
      message: 'Image deleted successfully from both storage systems!' 
    });
    
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete image' 
    });
  }
});

// Test Backblaze connection
app.get('/api/backblaze-test', async (req, res) => {
  try {
    const data = await s3.listBuckets().promise();
    
    res.json({
      success: true,
      message: 'Backblaze B2 connection successful!',
      buckets: data.Buckets,
      currentBucket: process.env.B2_BUCKET_NAME
    });
  } catch (error) {
    console.error('❌ Backblaze test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Backblaze B2 connection failed: ' + error.message
    });
  }
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log('🚀 =================================');
  console.log('🗄️  Image Gallery with MongoDB & Backblaze B2!');
  console.log('🚀 =================================');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`☁️  Backblaze Bucket: ${process.env.B2_BUCKET_NAME}`);
  console.log(`🌍 Backblaze Region: ${process.env.B2_REGION}`);
  console.log('🚀 =================================');
  console.log('📝 Test endpoints:');
  console.log(`   🔍 Health: http://localhost:${PORT}/api/test`);
  console.log(`   ☁️  Backblaze Test: http://localhost:${PORT}/api/backblaze-test`);
  console.log(`   📸 Images: http://localhost:${PORT}/api/images`);
  console.log('🚀 =================================');
});