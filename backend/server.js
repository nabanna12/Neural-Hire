import 'dotenv/config';
import dns from 'dns';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import interviewRoutes from './routes/interview.js';
import userRoutes from './routes/user.js';

// Fix DNS issue (important for some networks / Render)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 5000;

// ❗ Safety check for environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing in environment variables');
  process.exit(1);
}

/* =========================
   ✅ FIXED CORS CONFIG
========================= */
const allowedOrigins = [
  'https://neural-hire-swart.vercel.app',
  'https://neural-hire-smart.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('❌ Not allowed by CORS'));
    }
  },
  credentials: true
}));

/* ========================= */

app.use(express.json({ limit: '10mb' }));

// Rate limiting (protect API)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use('/api/', limiter);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'AI Interview Simulator API is running 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// MongoDB connection + start server
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
