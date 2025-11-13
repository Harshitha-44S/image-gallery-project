require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand, ListBucketsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { MongoClient } = require('mongodb');
const fs = require('fs');

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ======================
// MULTER CONFIGURATION
// ======================
const uploadMiddleware = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ======================
// BACKBLAZE B2 CONFIGURATION
// ======================
const s3Client = new S3Client({
  region: process.env.B2_REGION || 'us-east-005',
  endpoint: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY
  }
});

// ======================
// MONGODB CONFIGURATION
// ======================
const mongoClient = new MongoClient(process.env.MONGODB_URI);

// ======================
// HELPER FUNCTIONS
// ======================
function getContentType(fileName) {
  const ext = fileName.toLowerCase().split('.').pop();
  const types = {
    'jpg': 'image/jpeg', 
    'jpeg': 'image/jpeg', 
    'png': 'image/png',
    'gif': 'image/gif', 
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  };
  return types[ext] || 'image/jpeg';
}

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ======================
// ROUTES
// ======================

// Homepage
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Image Gallery Backend with Backblaze B2',
    status: 'Running',
    endpoints: {
      upload: 'POST /api/upload',
      imagesUpload: 'POST /api/images/upload',
      images: 'GET /api/images',
      testBackblaze: 'GET /api/test-backblaze',
      health: 'GET /api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test MongoDB
    await mongoClient.db().admin().ping();
    
    // Test Backblaze
    await s3Client.send(new ListBucketsCommand({}));
    
    res.json({ 
      status: 'healthy',
      services: {
        mongodb: 'connected',
        backblaze: 'connected',
        backend: 'running'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test Backblaze connection
app.get('/api/test-backblaze', async (req, res) => {
  try {
    console.log('🧪 Testing Backblaze B2 Connection...');
    
    // Test 1: List buckets
    const listCommand = new ListBucketsCommand({});
    const bucketsResult = await s3Client.send(listCommand);
    console.log('✅ Backblaze B2 Connected Successfully!');
    
    // FIX: Properly extract bucket names
    if (bucketsResult.Buckets && bucketsResult.Buckets.length > 0) {
      const bucketNames = bucketsResult.Buckets.map(b => b.Name).filter(name => name);
      console.log('   - Available buckets:', bucketNames);
      
      // Check if our bucket exists
      if (bucketNames.includes(process.env.B2_BUCKET_NAME)) {
        console.log('✅ Our bucket found:', process.env.B2_BUCKET_NAME);
      } else {
        console.log('❌ Bucket not found:', process.env.B2_BUCKET_NAME);
        console.log('   Available buckets:', bucketNames);
      }
    } else {
      console.log('   - No buckets found or empty response');
    }
    
    res.json({
      success: true,
      message: 'Backblaze B2 is working!',
      bucket: process.env.B2_BUCKET_NAME,
      availableBuckets: bucketsResult.Buckets ? bucketsResult.Buckets.map(b => b.Name) : []
    });
    
  } catch (error) {
    console.log('❌ Backblaze test failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Backblaze test failed: ' + error.message
    });
  }
});

// ✅ ROUTE 1: Original upload route
app.post('/api/upload', uploadMiddleware.single('image'), async (req, res) => {
  console.log('\n🔄 ===== UPLOAD STARTED (/api/upload) =====');
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file received' 
      });
    }

    console.log('📦 File received:', req.file.originalname);
    console.log('📊 File size:', req.file.size, 'bytes');

    // Read the file
    const imageBuffer = fs.readFileSync(req.file.path);
    const fileName = req.file.originalname;
    const userId = 'user-' + Date.now();

    console.log('☁️ Starting Backblaze B2 upload...');

    // Upload to Backblaze B2
    const fileKey = `images/${userId}/${Date.now()}-${fileName}`;
    
    const uploadParams = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileKey,
      Body: imageBuffer,
      ContentType: getContentType(fileName)
    };

    console.log('   - Uploading to Backblaze...');
    
    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
      console.log('✅ SUCCESS: Image uploaded to Backblaze B2');
    } catch (backblazeError) {
      console.log('❌ BACKBLAZE UPLOAD FAILED:', backblazeError.message);
      throw new Error('Backblaze upload failed: ' + backblazeError.message);
    }

    // Generate signed URL
    const signedUrl = await getSignedUrl(
      s3Client, 
      new GetObjectCommand({ 
        Bucket: process.env.B2_BUCKET_NAME, 
        Key: fileKey 
      }), 
      { expiresIn: 86400 }
    );

    // Store in MongoDB
    const database = mongoClient.db('image-gallery');
    const result = await database.collection('images').insertOne({
      filename: fileName,
      b2Key: fileKey,
      userId: userId,
      uploadDate: new Date(),
      fileSize: imageBuffer.length,
      url: signedUrl,
      mimetype: req.file.mimetype
    });

    // Clean up temporary file
    fs.unlinkSync(req.file.path);
    
    console.log('🎉 Upload completed successfully!');
    
    res.json({ 
      success: true, 
      imageUrl: signedUrl,
      fileKey: fileKey,
      imageId: result.insertedId,
      message: 'Image uploaded successfully!' 
    });
    
  } catch (error) {
    console.log('❌ Upload failed:', error.message);
    
    // Clean up temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Upload failed: ' + error.message 
    });
  }
});

// ✅ ROUTE 2: React frontend upload route (the one you need)
app.post('/api/images/upload', uploadMiddleware.single('image'), async (req, res) => {
  console.log('\n🔄 ===== UPLOAD STARTED (/api/images/upload) =====');
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file received' 
      });
    }

    console.log('📦 File received:', req.file.originalname);
    console.log('📊 File size:', req.file.size, 'bytes');

    // Read the file
    const imageBuffer = fs.readFileSync(req.file.path);
    const fileName = req.file.originalname;
    const userId = 'user-' + Date.now();

    console.log('☁️ Starting Backblaze B2 upload...');

    // Upload to Backblaze B2
    const fileKey = `images/${userId}/${Date.now()}-${fileName}`;
    
    const uploadParams = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileKey,
      Body: imageBuffer,
      ContentType: getContentType(fileName)
    };

    console.log('   - Uploading to Backblaze...');
    
    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
      console.log('✅ SUCCESS: Image uploaded to Backblaze B2');
    } catch (backblazeError) {
      console.log('❌ BACKBLAZE UPLOAD FAILED:', backblazeError.message);
      throw new Error('Backblaze upload failed: ' + backblazeError.message);
    }

    // Generate signed URL
    const signedUrl = await getSignedUrl(
      s3Client, 
      new GetObjectCommand({ 
        Bucket: process.env.B2_BUCKET_NAME, 
        Key: fileKey 
      }), 
      { expiresIn: 86400 }
    );

    // Store in MongoDB
    const database = mongoClient.db('image-gallery');
    const result = await database.collection('images').insertOne({
      filename: fileName,
      b2Key: fileKey,
      userId: userId,
      uploadDate: new Date(),
      fileSize: imageBuffer.length,
      url: signedUrl,
      mimetype: req.file.mimetype
    });

    // Clean up temporary file
    fs.unlinkSync(req.file.path);
    
    console.log('🎉 Upload completed successfully!');
    
    res.json({ 
      success: true, 
      imageUrl: signedUrl,
      fileKey: fileKey,
      imageId: result.insertedId,
      message: 'Image uploaded successfully!' 
    });
    
  } catch (error) {
    console.log('❌ Upload failed:', error.message);
    
    // Clean up temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Upload failed: ' + error.message 
    });
  }
});

// Get all images
app.get('/api/images', async (req, res) => {
  try {
    console.log('📁 Fetching all images from MongoDB');
    
    const database = mongoClient.db('image-gallery');
    const images = await database.collection('images')
      .find({})
      .sort({ uploadDate: -1 })
      .toArray();
    
    console.log(`✅ Returning ${images.length} images from MongoDB`);
    
    res.json({ 
      success: true, 
      images: images,
      count: images.length 
    });
  } catch (error) {
    console.log('❌ Error fetching images:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch images: ' + error.message 
    });
  }
});

// ======================
// SERVER STARTUP
// ======================
async function startServer() {
  try {
    console.log('🚀 =================================');
    console.log('🗄️  Image Gallery Backend Starting...');
    console.log('🚀 =================================');
    
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('✅ MongoDB Atlas Connected!');
    
    // Start the server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log('📍 Port:', PORT);
      console.log('🌐 Server: http://localhost:' + PORT);
      console.log('📸 Backblaze Bucket:', process.env.B2_BUCKET_NAME);
      console.log('🚀 =================================\n');
    });
    
  } catch (error) {
    console.log('❌ Server startup error:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoClient.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Start the application
startServer();