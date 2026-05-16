import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb';

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Test Route
app.get('/api/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running!' });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Lead Routes
app.use('/api/leads', leadRoutes);

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err: Error & { code?: number }, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  if (err.code === 11000) {
    res.status(400).json({ message: 'Duplicate value already exists' });
    return;
  }

  if (err.message === 'User already exists' || err.name === 'ValidationError' || err.name === 'CastError') {
    res.status(400).json({ message: err.message });
    return;
  }

  if (err.message === 'Invalid credentials') {
    res.status(401).json({ message: err.message });
    return;
  }

  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
