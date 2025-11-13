import React, { useState, useEffect } from 'react';
import { imageAPI } from '../services/api';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await imageAPI.getAll(searchQuery);
      console.log('Fetched images:', response);
      setImages(response.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      setMessage({ type: 'error', text: 'Failed to load images' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [searchQuery]);

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await imageAPI.delete(imageId);
      setMessage({ type: 'success', text: 'Image deleted successfully!' });
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      setMessage({ type: 'error', text: 'Failed to delete image' });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchImages();
  };

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2>Image Gallery</h2>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images..."
            style={{ 
              flex: '1', 
              padding: '0.75rem', 
              border: '2px solid #e1e5e9', 
              borderRadius: '8px' 
            }}
          />
          <button type="submit" style={{ 
            background: '#667eea', 
            color: 'white', 
            padding: '0.75rem 1.5rem', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer' 
          }}>
            Search
          </button>
        </form>
      </div>

      {message && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '8px', 
          margin: '1rem 0', 
          textAlign: 'center',
          background: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24'
        }}>
          {message.text}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading images...</p>
        </div>
      )}

      {!loading && images.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No images uploaded yet. <a href="/upload">Upload some images!</a></p>
        </div>
      )}

      {!loading && images.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {images.map((image) => (
            <div key={image._id} style={{ 
              background: 'white', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              border: '1px solid #e1e5e9'
            }}>
              {/* Image Display */}
              <div style={{ 
                width: '100%', 
                height: '200px', 
                overflow: 'hidden',
                background: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={image.signedUrl || `/api/images/file/${image._id}`}
                  alt={image.description || image.filename}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(image.signedUrl || `/api/images/file/${image._id}`, '_blank')}
                  onError={(e) => {
                    console.error('Failed to load image:', image.filename);
                    if (image.signedUrl) {
                      e.target.src = `/api/images/file/${image._id}`;
                    } else {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                    }
                  }}
                />
              </div>

              <div style={{ padding: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
                  {image.filename}
                </h4>
                
                {image.description && (
                  <p style={{ 
                    marginBottom: '0.5rem', 
                    color: '#666',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {image.description}
                  </p>
                )}
                
                {image.tags && image.tags.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem', 
                    margin: '0.5rem 0' 
                  }}>
                    {image.tags.map((tag, index) => (
                      <span key={index} style={{ 
                        background: '#e3f2fd', 
                        color: '#1976d2', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '20px', 
                        fontSize: '0.7rem' 
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#888', 
                  marginTop: '0.5rem',
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: '0.5rem'
                }}>
                  <div>Size: {(image.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                  <div>Type: {image.fileType}</div>
                  <div>Uploaded: {new Date(image.uploadDate).toLocaleDateString()}</div>
                  
                  {/* Signed URL Indicator */}
                  {image.signedUrl && (
                    <div style={{ 
                      marginTop: '0.5rem',
                      padding: '0.2rem 0.5rem',
                      background: '#e8f5e8',
                      color: '#2e7d32',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      display: 'inline-block'
                    }}>
                      🔐 Secure Cloud URL
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => window.open(image.signedUrl || `/api/images/file/${image._id}`, '_blank')}
                    style={{ 
                      flex: 1,
                      background: '#667eea', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.5rem', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    View Full Size
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(image._id)}
                    style={{ 
                      flex: 1,
                      background: '#e74c3c', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.5rem', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;