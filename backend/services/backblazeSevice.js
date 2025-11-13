const B2 = require('backblaze-b2');

class BackblazeService {
  constructor() {
    this.b2 = new B2({
      applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
      applicationKey: process.env.B2_APPLICATION_KEY
    });
    this.bucketId = process.env.B2_BUCKET_ID;
    this.bucketName = process.env.B2_BUCKET_NAME;
    this.endpoint = process.env.B2_ENDPOINT;
    this.authorized = false;
  }

  async authorize() {
    if (!this.authorized) {
      try {
        const response = await this.b2.authorize();
        this.authorized = true;
        console.log('✅ Backblaze B2 authorized successfully');
        return response;
      } catch (error) {
        console.error('❌ Backblaze authorization failed:', error.response?.data || error.message);
        throw error;
      }
    }
  }

  async uploadImage(file) {
    try {
      await this.authorize();
      
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `images/${Date.now()}_${file.originalname}`;
      
      console.log('📤 Uploading to Backblaze:', fileName);
      
      // Get upload URL and authorization token
      const uploadData = await this.b2.getUploadUrl({
        bucketId: this.bucketId
      });

      // Upload file to Backblaze B2
      const uploadResponse = await this.b2.uploadFile({
        uploadUrl: uploadData.data.uploadUrl,
        uploadAuthToken: uploadData.data.authorizationToken,
        fileName: fileName,
        data: file.buffer,
        contentLength: file.size,
        mime: file.mimetype
      });

      // Construct public URL - use the correct endpoint format
      const fileUrl = `${this.endpoint.replace('s3.', '')}/file/${this.bucketName}/${fileName}`;
      
      console.log('✅ Image uploaded to Backblaze B2:', fileName);
      console.log('🔗 File URL:', fileUrl);
      
      return {
        fileId: uploadResponse.data.fileId,
        fileName: fileName,
        fileUrl: fileUrl
      };
      
    } catch (error) {
      console.error('❌ Backblaze upload error:', error.response?.data || error.message);
      throw new Error('Failed to upload image to cloud storage: ' + (error.response?.data?.message || error.message));
    }
  }

  async deleteImage(fileId, fileName) {
    try {
      await this.authorize();
      
      await this.b2.deleteFileVersion({
        fileId: fileId,
        fileName: fileName
      });
      
      console.log('✅ Image deleted from Backblaze B2:', fileName);
      return true;
    } catch (error) {
      console.error('❌ Backblaze delete error:', error.response?.data || error.message);
      throw new Error('Failed to delete image from cloud storage');
    }
  }
}

module.exports = new BackblazeService();