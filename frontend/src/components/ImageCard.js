import React from 'react';

const ImageCard = ({ image, onDelete }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="image-card">
      <img 
        src={`http://localhost:5001${image.url}`} 
        alt={image.filename}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
        }}
      />
      <div className="image-info">
        <h4>{image.filename}</h4>
        {image.description && <p>{image.description}</p>}
        
        {image.tags && image.tags.length > 0 && (
          <div className="tags">
            {image.tags.map((tag, index) => (
              <span key={index} className="tag">#{tag}</span>
            ))}
          </div>
        )}
        
        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
          <div>Size: {formatFileSize(image.fileSize)}</div>
          <div>Uploaded: {formatDate(image.uploadDate)}</div>
        </div>
        
        <button 
          className="delete-btn" 
          onClick={() => onDelete(image._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ImageCard;