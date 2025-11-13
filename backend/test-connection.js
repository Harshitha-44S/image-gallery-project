// test-connection.js
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'us-east-005',
  endpoint: 'https://s3.us-east-005.backblazeb2.com',
  credentials: {
    accessKeyId: '005de211e61b24f0000000001',
    secretAccessKey: 'K005OH7cSHOCPUa/kkymm5NuS9O7HI8'
  }
});

async function testConnection() {
  try {
    const command = new ListBucketsCommand({});
    const result = await s3Client.send(command);
    console.log('✅ Backblaze B2 Connected Successfully!');
    console.log('Available buckets:', result.Buckets);
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

testConnection();