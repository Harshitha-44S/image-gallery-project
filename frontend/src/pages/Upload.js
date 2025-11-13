import React, { useState, useRef } from 'react';
import { imageAPI } from '../services/api';

const Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    tags: ''
  });
  
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File too large. Maximum size is 5MB.' });
        return;
      }
      setSelectedFile(file);
      setMessage(null);
    } else {
      setMessage({ type: 'error', text: 'Please select a valid image file (JPG, PNG, GIF)' });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage(null);

    const uploadFormData = new FormData();
    uploadFormData.append('image', selectedFile);
    uploadFormData.append('description', formData.description);
    uploadFormData.append('tags', formData.tags);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 20;
        });
      }, 200);

      // This is line 65 - the upload call
      const response = await imageAPI.upload(uploadFormData);
      
      clearInterval(progressInterval);
      setProgress(100);

      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      console.log('Upload response:', response);

      // Reset form
      setFormData({ description: '', tags: '' });
      setSelectedFile(null);
      fileInputRef.current.value = '';

      setTimeout(() => {
        setProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: error.message || 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2>Upload Image to Cloud</h2>
      
      <form onSubmit={handleSubmit}>
        <div 
          style={{ 
            border: '2px dashed #667eea', 
            borderRadius: '10px', 
            padding: '3rem', 
            textAlign: 'center', 
            marginBottom: '2rem', 
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9ff'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          onClick={() => fileInputRef.current.click()}
        >
          <div>
            <h3>📁 Click to select your image</h3>
            <p>Supports: JPG, PNG, GIF (Max: 5MB)</p>
            {selectedFile && (
              <p style={{ marginTop: '1rem', color: '#667eea', fontWeight: 'bold' }}>
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files[0])}
          accept="image/*"
          style={{ display: 'none' }}
        />

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
            Description (optional):
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your image..."
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              border: '2px solid #e1e5e9', 
              borderRadius: '8px', 
              fontSize: '1rem' 
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
            Tags (optional):
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="nature, vacation, portrait (comma separated)"
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              border: '2px solid #e1e5e9', 
              borderRadius: '8px', 
              fontSize: '1rem' 
            }}
          />
        </div>

        {progress > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: '#e1e5e9', 
              borderRadius: '4px', 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                height: '100%', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                borderRadius: '4px', 
                width: `${progress}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {progress}% {progress === 100 ? 'Complete!' : 'Uploading...'}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={uploading || !selectedFile}
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            opacity: (uploading || !selectedFile) ? 0.6 : 1
          }}
        >
          {uploading ? 'Uploading...' : 'Upload to Cloud'}
        </button>
      </form>

      {message && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '8px', 
          margin: '1rem 0', 
          textAlign: 'center',
          background: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default Upload;