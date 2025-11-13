const AWS = require('aws-sdk');

class S3BackblazeService {
  constructor() {
    this.s3 = new AWS.S3({
      endpoint: new AWS.Endpoint(process.env.B2_ENDPOINT),
      accessKeyId: process.env.B2_APPLICATION_KEY_ID,
      secretAccessKey: process.env.B2_APPLICATION_KEY,
      s3ForcePathStyle: true,
      signatureVersion: 'v4'
    });
    this.bucketName = process.env.B2_BUCKET_NAME;
  }

  async uploadImage(file) {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `images/${Date.now()}_${file.originalname}`;
      
      console.log('📤 Uploading to Backblaze via S3:', fileName);
      
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };

      const uploadResult = await this.s3.upload(uploadParams).promise();
      
      console.log('✅ Image uploaded to Backblaze:', fileName);
      console.log('🔗 File URL:', uploadResult.Location);
      
      return {
        fileId: uploadResult.ETag,
        fileName: fileName,
        fileUrl: uploadResult.Location
      };
      
    } catch (error) {
      console.error('❌ Backblaze S3 upload error:', error.message);
      throw new Error('Failed to upload image to cloud storage: ' + error.message);
    }
  }

  async deleteImage(fileId, fileName) {
    try {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: fileName
      }).promise();
      
      console.log('✅ Image deleted from Backblaze:', fileName);
      return true;
    } catch (error) {
      console.error('❌ Backblaze S3 delete error:', error.message);
      throw new Error('Failed to delete image from cloud storage');
    }
  }
}

module.exports = new S3BackblazeService();