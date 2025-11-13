require('dotenv').config();
const { MongoClient } = require('mongodb');
const { uploadToBackblaze } = require('./backblaze');

async function uploadStoredImages() {
  const mongoClient = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB');
    
    const database = mongoClient.db('image-gallery');
    const images = database.collection('images');
    
    // Find all images that have buffer but no b2Key (not uploaded to Backblaze)
    const storedImages = await images.find({ 
      buffer: { $exists: true },
      b2Key: { $exists: false }
    }).toArray();
    
    console.log(`📦 Found ${storedImages.length} images to upload to Backblaze`);
    
    for (const image of storedImages) {
      console.log(`\n🔄 Uploading: ${image.filename}`);
      
      try {
        // Convert Base64 buffer to actual buffer
        const imageBuffer = Buffer.from(image.buffer.buffer);
        
        // Upload to Backblaze
        const backblazeResult = await uploadToBackblaze(imageBuffer, image.filename, 'migration-user');
        
        if (backblazeResult.success) {
          // Update the document with Backblaze info
          await images.updateOne(
            { _id: image._id },
            { 
              $set: { 
                b2Key: backblazeResult.fileKey,
                url: backblazeResult.url,
                status: 'uploaded_to_backblaze',
                migratedAt: new Date()
              },
              $unset: { buffer: "" } // Remove the base64 buffer to save space
            }
          );
          console.log(`✅ Uploaded: ${image.filename}`);
          console.log(`   📍 Backblaze Key: ${backblazeResult.fileKey}`);
        } else {
          console.log(`❌ Failed: ${image.filename} - ${backblazeResult.error}`);
        }
        
      } catch (error) {
        console.log(`❌ Error uploading ${image.filename}:`, error.message);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.log('❌ Migration failed:', error.message);
  } finally {
    await mongoClient.close();
  }
}

// Run the migration
uploadStoredImages();