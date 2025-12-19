// routes/profilePicture.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for profile picture upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile-pictures';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.user.userId;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${userId}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Upload profile picture
router.post('/upload', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get user to check if they have an existing profile picture
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldImagePath = user.profilePicture.replace('/uploads', 'uploads');
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new profile picture path
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: profilePictureUrl,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        role: true,
        accountNumber: true,
        balance: true,
        roi: true,
        referralBonus: true,
        country: true,
        state: true,
        address: true,
        phone: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true,
        bankName: true,
        accountName: true,
        bankAccountNumber: true,
        routingCode: true
      }
    });

    res.json({
      message: 'Profile picture uploaded successfully',
      user: updatedUser,
      profilePicture: profilePictureUrl
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file && req.file.path) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to upload profile picture',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Remove profile picture - MAKE SURE THIS EXISTS
router.delete('/remove', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user to check current profile picture
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the file if exists
    if (user.profilePicture) {
      const imagePath = user.profilePicture.replace('/uploads', 'uploads');
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log('Deleted profile picture file:', imagePath);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }

    // Update user to remove profile picture
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        role: true,
        accountNumber: true,
        balance: true,
        roi: true,
        referralBonus: true,
        country: true,
        state: true,
        address: true,
        phone: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true,
        bankName: true,
        accountName: true,
        bankAccountNumber: true,
        routingCode: true
      }
    });

    res.json({
      message: 'Profile picture removed successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile picture removal error:', error);
    res.status(500).json({ 
      error: 'Failed to remove profile picture',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get profile picture
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        profilePicture: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      profilePicture: user.profilePicture,
      firstName: user.firstName,
      lastName: user.lastName
    });

  } catch (error) {
    console.error('Profile picture fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile picture' });
  }
});

export default router;