require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simple test endpoint
app.post('/test-upload', (req, res) => {
  console.log('📨 TEST: Request received');
  console.log('📨 TEST: Headers:', req.headers);
  console.log('📨 TEST: Body keys:', Object.keys(req.body));
  console.log('📨 TEST: Content-Type:', req.headers['content-type']);
  
  res.json({ 
    success: true, 
    message: 'Test endpoint works!',
    bodySize: req.body ? JSON.stringify(req.body).length : 0
  });
});

app.listen(5001, () => {
  console.log('🔧 Debug server running on port 5001');
});