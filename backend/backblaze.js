const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.B2_REGION || 'us-east-005',
  endpoint: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY
  }
});

async function uploadToBackblaze(imageBuffer, fileName, userId) {
  try {
    console.log('   ☁️ Uploading to Backblaze...');
    
    const fileKey = `migrated-images/${userId}/${Date.now()}-${fileName}`;
    
    const uploadParams = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileKey,
      Body: imageBuffer,
      ContentType: 'image/jpeg'
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    
    const signedUrl = await getSignedUrl(
      s3Client, 
      new GetObjectCommand({ 
        Bucket: process.env.B2_BUCKET_NAME, 
        Key: fileKey 
      }), 
      { expiresIn: 86400 }
    );

    return {
      success: true,
      fileKey: fileKey,
      url: signedUrl
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { uploadToBackblaze };