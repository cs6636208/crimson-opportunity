import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import candidateRoutes from './routes/candidates.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(cors());
app.use(express.json());

// Basic Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api', apiLimiter, aiRoutes);
app.use('/api/candidates', apiLimiter, candidateRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Platform Secure Backend is running smoothly.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🔒 Secure Backend Server running on http://localhost:${PORT}`);
});
