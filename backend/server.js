process.env.DEBUG = 'prisma:*';
import express from "express";
import oilRoutes from "./routes/oil.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import investmentRoutes from './routes/investmentRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import userInvestmentRoutes from './routes/userInvestmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import investmentApplicationRoutes from './routes/investmentApplicationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import depositRoutes from './routes/depositRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import profilePictureRoutes from './routes/profilePictureRoutes.js';

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
const investmentsDir = path.join(uploadsDir, 'investments');
const newsDir = path.join(uploadsDir, 'news');

[uploadsDir, investmentsDir, newsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

if (!fs.existsSync('uploads/receipts')) {
  fs.mkdirSync('uploads/receipts', { recursive: true });
}

// Add this with your other directory creation code
if (!fs.existsSync('uploads/deposit-receipts')) {
  fs.mkdirSync('uploads/deposit-receipts', { recursive: true });
}

// Add this with your other directory creation code in server.js
const profilePicsDir = path.join(uploadsDir, 'profile-pictures');
[profilePicsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

const Port = process.env.PORT || 5000
const app = express();

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://civvest.com', "https://www.civvest.com"];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, origin);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
}));

// CRITICAL: cookieParser must come before routes
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/profile-pictures', express.static(path.join(__dirname, 'uploads/profile-pictures')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/oil", oilRoutes);
app.use('/api/profile-picture', profilePictureRoutes);

// FIXED: Use authenticateToken instead of isAuthenticated
app.use('/api/user-investments', authenticateToken, userInvestmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/investment-applications', investmentApplicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/contact', contactRoutes);

// Admin middleware function
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Admin-only routes (must use authenticateToken first, then isAdmin)
app.post('/api/investments', authenticateToken, isAdmin, investmentRoutes);
app.put('/api/investments/:id', authenticateToken, isAdmin, investmentRoutes);
app.delete('/api/investments/:id', authenticateToken, isAdmin, investmentRoutes);
app.get('/api/investment-applications/admin/all', authenticateToken, isAdmin, investmentApplicationRoutes);
app.put('/api/investment-applications/:id/status', authenticateToken, isAdmin, investmentApplicationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: allowedOrigins,
      yourOrigin: req.headers.origin
    }
  });
});

// Enhanced CORS test endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    allowedOrigins: allowedOrigins,
    yourOrigin: req.headers.origin,
    cookiesReceived: req.cookies,
    timestamp: new Date().toISOString()
  });
});

// Cookie test endpoint - to verify cookies are being set correctly
app.get('/api/test-cookie', (req, res) => {
  // Set a test cookie
  res.cookie('test_cookie', 'test_value', {
    httpOnly: true,
    secure: false, // false for local development
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  res.json({ 
    message: 'Test cookie set!',
    yourOrigin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS Error',
      message: 'Origin not allowed',
      yourOrigin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

app.listen((Port), () => {
  console.log(`✅ Server is running on Localhost: ${Port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 CORS enabled for:`);
  allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
  console.log(`📧 SMTP configured for: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`🍪 Cookie support: Enabled (credentials: true)`);
});
