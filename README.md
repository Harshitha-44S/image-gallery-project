# Image Storage and Retrieval on Cloud

**Name:** HARSHITHA.S.  
**Student ID:** 4MH23CA016  
**Topic:** IMAGE STORAGE AND RETRIEVAL ON CLOUD  
**Submission Date:** NOVEMBER 18, 2025  
**GitHub Repository:** https://github.com/Harshitha-44S/image-gallery-project  

## Table of Contents
1. [Introduction](#introduction)
2. [Objectives](#objectives)
3. [Background & Theory](#background--theory)
4. [System Architecture](#system-architecture)
5. [Implementation](#implementation)
6. [Results](#results)
7. [Discussion](#discussion)
8. [Conclusion](#conclusion)
9. [References](#references)

## Introduction
Basically, this is a web app that helps you store, organize, and find digital pictures easily by using the cloud. Since we're dealing with tons of digital photos these days, old ways of storing them just aren't cutting it anymore when it comes to handling more stuff, saving money, and getting to your files. This project tackles those issues by building a new system. It uses React.js for what you see, Node.js for what happens behind the scenes, MongoDB to keep track of info about the images, and Backblaze B2 Cloud Storage to safely and affordably keep your pictures.

## Objectives
### Primary Objectives
- Make a user-friendly website where you can upload and manage pictures.
- Build a secure system for handling and storing images.
- Connect it to Backblaze B2 for storing lots of images.
- Keep all the image details in a MongoDB database.
- Make it easy to find and show the images.

### Technical Objectives
- We need to make it possible to upload files and see how far along the upload is.
- The system should be able to handle common image types like JPEG, PNG, GIF, and WebP.
- Users should be able to see a preview of their images and any associated information.
- We'll build in ways to deal with problems and let users know what's happening.
- It's important to make sure that file access and the API connections are safe.

## Background & Theory
### Cloud Storage Architecture
Services like Backblaze B2 offer storage for data as objects, accessible through web-based APIs. This approach is built for the long haul and can grow as needed, often at a better price than older storage methods. Our setup works like this:

- The front part users see and interact with is a React.js app.
- The back part, a Node.js/Express.js API, handles the core operations.
- We're using MongoDB to keep track of image details and who owns them.
- Backblaze B2 is where the actual image files will be stored.

### Key Technologies
- **React.js**: A popular JavaScript tool for creating interactive web pages.
- **Node.js**: A way to run JavaScript on the server.
- **Express.js**: A framework that makes building web APIs easier.
- **MongoDB**: A flexible database for storing data that doesn't fit neatly into tables.
- **Backblaze B2**: A cloud storage service that's compatible with Amazon S3.

## System Architecture
┌─────────────────┐ HTTP Requests ┌──────────────────┐
│ React.js │ ◄─────────────────► │ Node.js/ │
│ Frontend │ │ Express.js │
│ │ JSON Responses │ Backend API │
└─────────────────┘ └─────────┬────────┘
│
┌───────┼───────┐
│ │ │
┌───────▼─┐ ┌───▼────┐ │
│ MongoDB │ │Backblaze│ │
│(Metadata)│ │ B2 │ │
│ │ │(Images) │ │
└─────────┘ └─────────┘ │

text

## Implementation
### Frontend Implementation (React.js)
```jsx
// Example: ImageUpload Component
import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await axios.post('/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  return (
    <div className="upload-container">
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      <button onClick={() => handleFileUpload(selectedFile)}>
        Upload Image
      </button>
      {uploadProgress > 0 && (
        <progress value={uploadProgress} max="100" />
      )}
    </div>
  );
};


 Backend Implementation (Node.js)
javascript
// server.js - Main server file
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Backblaze = require('backblaze-b2');
const Image = require('./models/Image');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Backblaze B2 Configuration
const b2 = new Backblaze({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY
});

// Upload endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    
    // Upload to Backblaze B2
    const uploadResponse = await b2.uploadFile({
      fileName: file.originalname,
      data: fs.readFileSync(file.path),
      bucketId: process.env.B2_BUCKET_ID
    });
    
    // Save metadata to MongoDB
    const image = new Image({
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      b2FileId: uploadResponse.data.fileId,
      uploadDate: new Date()
    });
    
    await image.save();
    
    // Clean up temporary file
    fs.unlinkSync(file.path);
    
    res.json({
      success: true,
      imageId: image._id,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
Results
Functional Results
Image Upload: It works perfectly, and you can see the progress.

Metadata Storage: We're saving and getting data from MongoDB really smoothly.

Cloud Integration: It's all set up with Backblaze B2 without any hitches.

Image Retrieval: Getting and showing the saved pictures is super quick.

User Interface: The frontend, built with React.js, is easy to use and looks good on any device.

Discussion
Challenges Faced
CORS Configuration: Cross-origin issues between frontend and backend

Solution: Implemented proper CORS middleware in Express.js

File Size Limitations: Handling large file uploads

Solution: Configured Multer limits and implemented chunked uploads

Backblaze Authentication: Managing secure API keys

Solution: Used environment variables and secure credential storage

Technical Insights
React Hooks made managing state in our functional components a lot simpler.

Using Async/Await really cleaned up how we handle asynchronous tasks.

Error Boundaries helped us catch and manage frontend errors better.

Environment variables made keeping our configurations secure much easier.

Conclusion
The Cloud-Based Image Storage and Retrieval System successfully demonstrates a modern approach to digital asset management using cloud technologies. The integration of React.js, Node.js, MongoDB, and Backblaze B2 provides a scalable, cost-effective solution for image storage needs.

Key Achievements
Built a fully functional full-stack application

Successfully integrated multiple technologies

Implemented secure file upload and retrieval

Created a responsive and user-friendly interface

References
Official Documentation
React.js - https://reactjs.org/docs/getting-started.html

Node.js - https://nodejs.org/en/docs/

Express.js - https://expressjs.com/en/guide.html

MongoDB - https://docs.mongodb.com/

Backblaze B2 - https://www.backblaze.com/b2/docs/
