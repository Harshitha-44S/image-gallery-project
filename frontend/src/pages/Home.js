import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <h1>Welcome to Cloud Image Gallery</h1>
      <p style={{ fontSize: '1.2rem', margin: '1rem 0 2rem', color: '#666' }}>
        Store, manage, and retrieve your images using cloud storage
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '2rem', 
        margin: '3rem 0' 
      }}>
        <div style={{ padding: '2rem', background: 'white', borderRadius: '10px', boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}>
          <h3>📤 Upload Images</h3>
          <p>Select images to upload to cloud</p>
          <Link to="/upload" className="btn" style={{ display: 'inline-block', marginTop: '1rem', background: '#667eea', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '5px', textDecoration: 'none' }}>
            Start Uploading
          </Link>
        </div>
        
        <div style={{ padding: '2rem', background: 'white', borderRadius: '10px', boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}>
          <h3>🖼️ Browse Gallery</h3>
          <p>View all your uploaded images</p>
          <Link to="/gallery" className="btn" style={{ display: 'inline-block', marginTop: '1rem', background: '#667eea', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '5px', textDecoration: 'none' }}>
            View Gallery
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;