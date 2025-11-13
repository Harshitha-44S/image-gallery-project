# Image Storage and Retrieval on Cloud



## Project Overview
A full-stack web application for storing and retrieving images using cloud storage. The application features a React.js frontend, Node.js backend, MongoDB for metadata storage, and Backblaze B2 Cloud Storage for image storage.

## Technology Stack
- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Cloud Storage**: Backblaze B2
- **Additional Libraries**: Multer, Axios, Mongoose

## Project Structure
image-storage-app/
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── services/
│ │ └── styles/
│ └── public/
├── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── config/
│ └── utils/
└── README.md

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Backblaze B2 account

### Backend Setup
1. Navigate to backend directory:
```bash
cd backend

2.Install dependencies:
  bash
  npm install

3.Create .env file:
   env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   BACKBLAZE_APPLICATION_KEY_ID=your_backblaze_key_id
   BACKBLAZE_APPLICATION_KEY=your_backblaze_application_key
   BACKBLAZE_BUCKET_ID=your_backblaze_bucket_id
   BACKBLAZE_BUCKET_NAME=your_bucket_name
   CORS_ORIGIN=http://localhost:3000

4.Start the server:
   bash
   npm start

###Frontend Setup
1.Navigate to frontend directory:
  bash
  cd frontend

2.Install dependencies:
  bash
  npm install

3.Create .env file:
  env
  REACT_APP_API_BASE_URL=http://localhost:5000/api

4.Start development server:
  bash
  npm start

### API Endpoints
  POST /api/images/upload - Upload image

  GET /api/images - Get all images

  GET /api/images/:id - Get specific image

  DELETE /api/images/:id - Delete image

### Database Schema
  {
  _id: ObjectId,
  filename: String,
  originalName: String,
  description: String,
  tags: Array,
  fileSize: Number,
  fileType: String,
  backblazeKey: String,
  backblazeUrl: String,
  backblazeBucket: String,
  uploadDate: Date,
  __v: Number
}

### Field Descriptions:
_id: Unique MongoDB identifier

filename: Generated unique filename for storage

originalName: Original filename from user upload

description: User-provided image description

tags: Array for categorizing images (currently empty)

fileSize: Image size in bytes (e.g., 90333)

fileType: MIME type (e.g., "image/jpeg")

backblazeKey: Storage path in Backblaze B2

backblazeUrl: Public URL for image access

backblazeBucket: Backblaze bucket name

uploadDate: Timestamp of upload

__v: Mongoose version key

### Key Features
 1.Image Upload

    Drag and drop interface

    Multiple file selection

    Progress indicators

    File validation (type and size)

    Automatic unique filename generation

 2.Image Retrieval

    Gallery view with thumbnails

    Search and filter capabilities

    Pagination for large datasets

    Direct download links from Backblaze

 3.Cloud Storage Integration

    Secure upload to Backblaze B2

    Automatic URL generation

    Efficient file management

    Cost-effective storage solution


### Implementation
### Backend Implementation
    File upload processing with Multer

    Backblaze B2 API integration for cloud storage

    MongoDB operations for metadata management

    RESTful API endpoints for CRUD operations

    Unique filename generation with timestamps

### Frontend Implementation
     The frontend provides:

    Responsive user interface built with React.js

    Real-time upload progress indicators

    Image preview and gallery functionality

    Error handling and user feedback

    API service layer for backend communication

### Configuration
### Backblaze B2 Setup
Create Backblaze B2 account at backblaze.com

Create a new bucket (e.g., "imagevault-pro-2024")

Generate application keys with read/write permissions

Configure CORS settings for your frontend domain

Set up proper bucket policies for public/private access
### MongoDB Setup
Set up MongoDB Atlas cluster

Create database user with read/write permissions

Whitelist your application IP addresses

Obtain connection string for environment configuration

Create collections for image metadata

### Testing
### Backend Testing
bash
cd backend
npm test
### Test coverage includes:

Image upload and metadata saving

Backblaze B2 integration

Database operations

Error handling scenarios

API endpoint validation

### Frontend Testing
bash
cd frontend
npm test
###Test coverage includes:

Component rendering

User interactions

API service calls

Error state handling

File upload functionality

###Manual Testing Checklist
Image upload with various file types (JPEG, PNG, etc.)

Image retrieval and display in gallery

Error handling for invalid file uploads

Responsive design on different devices

Database connection and data persistence

Backblaze B2 cloud storage integration

Progress indicators during upload

File metadata accuracy

###Deployment
###Backend Deployment
Deploy to Heroku, AWS, or similar platform

Set environment variables in deployment platform

Configure MongoDB Atlas network access

Set up process manager (PM2) for production

Configure CORS for production frontend URL

###Frontend Deployment
Build React application: npm run build

Deploy to Netlify, Vercel, or similar platform

Update API endpoints for production environment

Configure environment variables

Set up custom domain if needed

###Challenges and Solutions
###Challenge 1: Large File Uploads
Problem: Handling large image files efficiently without timeout issues
Solution: Implemented chunked uploads with progress tracking and file size validation

###Challenge 2: Backblaze B2 Authentication
Problem: Managing B2 API authentication tokens and handling token expiration
Solution: Implemented token refresh mechanism with proper error handling and retry logic

###Challenge 3: Database Performance
Problem: Slow image metadata retrieval with growing dataset
Solution: Added proper indexing on frequently queried fields and implemented pagination

###Challenge 4: Unique File Naming
Problem: File name conflicts when multiple users upload files with same names
Solution: Implemented timestamp-based unique filename generation with random strings

###Future Enhancements
Image Processing: Server-side image compression and thumbnail generation

Advanced Tagging: AI-based automatic image tagging and categorization

User Authentication: User registration and private gallery functionality

Bulk Operations: Batch upload, download, and deletion operations

Advanced Search: Text-based search in descriptions and AI-based visual search

Video Support: Extend to support video file storage and streaming

CDN Integration: Content delivery network for faster global access

Access Control: Role-based access control for image sharing

###Contributing
Fork the repository

Create a feature branch: git checkout -b feature/new-feature

Commit your changes: git commit -am 'Add new feature'

Push to the branch: git push origin feature/new-feature

Create a Pull Request



###GitHub Repository
🔗 Repository Link: 

###Contact
For questions or support, please contact:

Name: Harshitha.S.

Student ID: 4MH23CA016

Submission Date: November 18th, 2025

*This project demonstrates a complete cloud-based image storage and retrieval system using modern web technologies and cloud services, with successful integration of React.js, Node.js, MongoDB, and Backblaze B2 Cloud Storage.*



