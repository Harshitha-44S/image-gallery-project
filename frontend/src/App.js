import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Upload from './pages/Upload';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <h1>📷 Cloud Image Gallery</h1>
            <div className="nav-links">
              <a href="/">Home</a>
              <a href="/upload">Upload</a>
              <a href="/gallery">Gallery</a>
            </div>
          </div>
        </nav>

        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;