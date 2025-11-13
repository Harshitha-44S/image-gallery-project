require('dotenv').config();
const backblazeService = require('./services/s3backblazeService');

async function testBackblaze() {
  try {
    console.log('🔗 Testing Backblaze B2 connection...');
    
    // Test with a small buffer
    const testFile = {
      originalname: 'test.txt',
      mimetype: 'text/plain',
      buffer: Buffer.from('Hello Backblaze!'),
      size: 15
    };
    
    const result = await backblazeService.uploadImage(testFile);
    console.log('✅ Backblaze test successful!');
    console.log('File URL:', result.fileUrl);
    
  } catch (error) {
    console.log('❌ Backblaze test failed:', error.message);
  }
}

testBackblaze();