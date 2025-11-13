require('dotenv').config();
const { S3Client, PutObjectCommand, ListBucketsCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

// Backblaze B2 Configuration
const s3Client = new S3Client({
  region: process.env.B2_REGION,
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY
  }
});

async function testBackblazeConnection() {
  console.log('🔍 Testing Backblaze B2 Connection...');
  
  try {
    // Test 1: List buckets (basic connection test)
    console.log('1. Testing bucket access...');
    const listCommand = new ListBucketsCommand({});
    const buckets = await s3Client.send(listCommand);
    console.log('✅ Can list buckets:', buckets.Buckets.map(b => b.Name));
    
    // Test 2: Try to upload a small test file
    console.log('2. Testing file upload...');
    const testContent = 'This is a test file for Backblaze B2';
    const uploadParams = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: 'test-file.txt',
      Body: testContent,
      ContentType: 'text/plain'
    };

    const uploadCommand = new PutObjectCommand(uploadParams);
    await s3Client.send(uploadCommand);
    console.log('✅ File upload test successful!');
    
    console.log('🎉 All Backblaze B2 tests passed!');
    return true;
    
  } catch (error) {
    console.log('❌ Backblaze B2 Test Failed:');
    console.log('Error Name:', error.name);
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    
    if (error.$metadata) {
      console.log('HTTP Status:', error.$metadata.httpStatusCode);
    }
    
    return false;
  }
}

// Run the test
testBackblazeConnection().then(success => {
  if (success) {
    console.log('\n✅ Backblaze B2 is properly configured!');
    console.log('The issue might be in your frontend or image processing.');
  } else {
    console.log('\n❌ Backblaze B2 configuration has issues.');
    console.log('Please check your credentials and bucket permissions.');
  }
  process.exit();
});