# 📸 Image Storage and Retrieval on Cloud

### 🧑‍💻 Developed by: Harshitha S  
**Student ID:** (Add your ID here)  
**College:** Maharaja Institute of Technology Mysore  
**Submission Date:** November 18, 2025  

---

## 📘 Table of Contents
1. [Introduction](#introduction)
2. [Objectives](#objectives)
3. [Background / Theory](#background--theory)
4. [System Architecture](#system-architecture)
5. [Implementation](#implementation)
6. [Results](#results)
7. [Discussion](#discussion)
8. [Conclusion](#conclusion)
9. [Challenges and Learnings](#challenges-and-learnings)
10. [References](#references)
11. [GitHub Repository](#github-repository)

---

## 🧩 Introduction
This project, **Image Storage and Retrieval on Cloud**, is designed to provide an efficient, secure, and scalable solution for uploading, storing, and retrieving images using **cloud technology**.  
Users can upload images from a web interface built with **React.js**, and the backend developed in **Node.js** handles storage operations.  
The image metadata is stored in **MongoDB**, while the actual images are uploaded to the **Backblaze B2 Cloud Storage** platform.  
This system demonstrates real-world cloud integration and modern full-stack development practices.

---

## 🎯 Objectives
- To design a **cloud-based image storage and retrieval system**.  
- To integrate **React.js frontend**, **Node.js backend**, and **MongoDB** for metadata management.  
- To use **Backblaze B2 Cloud Storage** for storing and retrieving images.  
- To ensure data security, scalability, and easy access through a responsive interface.  
- To document and test the system thoroughly as per academic guidelines.

---

## 📚 Background / Theory
Cloud computing provides on-demand access to shared computing resources, offering scalability, flexibility, and cost-effectiveness.  
Image storage applications often face challenges in **storage cost, scalability, and retrieval speed**. Using **Backblaze B2**, a low-cost cloud storage solution, allows developers to store large amounts of image data reliably.  

### Technologies Used:
| Component | Technology |
|------------|-------------|
| Frontend | React.js |
| Backend | Node.js with Express |
| Database | MongoDB |
| Cloud Storage | Backblaze B2 |
| Version Control | Git & GitHub |
| Hosting (optional) | Render / Vercel / Netlify |

---

## 🏗️ System Architecture
+------------------------+
| React Frontend |
| (Image Upload & View) |
+----------+-------------+
|
v
+------------------------+
| Node.js Backend API |
| (Handles Requests & |
| Cloud Integration) |
+----------+-------------+
|
v
+------------------------+
| MongoDB |
| (Stores Metadata) |
+----------+-------------+
|
v
+------------------------+
| Backblaze Cloud B2 |
| (Stores Images) |
+------------------------+

---

## ⚙️ Implementation

### 🔹 1. Frontend (React.js)
- Designed a responsive interface using React.js and TailwindCSS.  
- Components:
  - **UploadForm.jsx** – to upload images  
  - **ImageGallery.jsx** – to display stored images  
- Used **Axios** to communicate with the backend API.

### 🔹 2. Backend (Node.js & Express)
- Created a RESTful API using Express.js.  
- Endpoints:
  - `POST /upload` – Upload image + metadata  
  - `GET /images` – Retrieve all stored images  
- Implemented **Multer** for handling image uploads before sending them to Backblaze.

### 🔹 3. Database (MongoDB)
- Each uploaded image stores metadata like:
  ```json
  {
    "filename": "sample.jpg",
    "fileUrl": "https://f005.backblazeb2.com/file/.../sample.jpg",
    "uploadDate": "2025-11-10T08:00:00Z",
    "size": "1.2MB"
  }
🔹 4. Cloud Storage (Backblaze B2)

Configured Backblaze API Keys and integrated SDK.

Uploaded images via API and stored returned URLs in MongoDB.

🧪 Results

Successfully uploaded images to Backblaze Cloud.

Retrieved and displayed stored images dynamically in the React frontend.

Verified metadata synchronization between MongoDB and Backblaze.

Ensured seamless cloud communication with low latency and high reliability.


💬 Discussion

This project demonstrates how a cloud-based storage system can replace traditional local storage methods.
The use of Backblaze reduces infrastructure cost and increases reliability.
The combination of MERN stack with cloud storage integration provides a scalable and future-ready approach to managing media files.

🧭 Conclusion

The Image Storage and Retrieval on Cloud system fulfills the goal of providing secure, scalable, and efficient cloud integration for image data.
It also showcases real-world application of React.js, Node.js, MongoDB, and Backblaze B2, which are widely used in modern software development.
The system can be further enhanced with user authentication, image compression, and AI-based tagging for automatic categorization.

🧠 Challenges and Learnings
Challenge	Resolution
Integrating Backblaze API	Followed SDK documentation and configured credentials properly
Handling large image files	Used Multer middleware to manage uploads efficiently
Asynchronous data retrieval	Implemented async/await and error handling
Displaying images dynamically	Mapped file URLs from MongoDB to frontend components
Deployment testing	Used Postman and manual UI testing for verification
Key Learnings:

Practical knowledge of cloud integration and REST APIs

Enhanced understanding of React.js and backend connectivity

Importance of data validation and metadata management

📚 References

Backblaze B2 Cloud Storage Documentation

React.js Official Documentation

Node.js & Express.js Documentation

MongoDB Documentation

Course and lecture materials from Maharaja Institute of Technology Mysore

🔗 GitHub Repository
   https://github.com/Harshitha-44S/image-gallery-project


