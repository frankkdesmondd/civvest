// routes/investmentRoutes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs'
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/investments';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'investment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Helper function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET all investments (public)
// In routes/investments.js, update the GET / route:
router.get('/', async (req, res) => {
  try {
    const { category, featured, status, bondOffering } = req.query;
    
    const where = {};
    if (category) where.category = category;
    if (featured !== undefined) where.featured = featured === 'true';
    if (status) where.status = status;
    else where.status = 'ACTIVE'; // Default to active investments
    if (bondOffering !== undefined) where.bondOffering = bondOffering === 'true';

    const investments = await prisma.investment.findMany({
      where,
      orderBy: [
        { bondOffering: 'desc' }, // Bond offerings first
        { minAmount: 'asc' }, // Sort by minAmount ascending
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// GET single investment by slug with related investments
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const investment = await prisma.investment.findUnique({
      where: { slug },
      include: {
        applications: {
          select: {
            id: true,
            amount: true,
            status: true
          }
        }
      }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    // Get related investments (same bondOffering type, different investment)
    const relatedInvestments = await prisma.investment.findMany({
      where: {
        bondOffering: investment.bondOffering, // Same type
        id: { not: investment.id },
        status: 'ACTIVE'
      },
      take: 3,
      orderBy: { featured: 'desc' }
    });

    res.json({
      investment,
      relatedInvestments
    });
  } catch (error) {
    console.error('Error fetching investment:', error);
    res.status(500).json({ error: 'Failed to fetch investment' });
  }
});

// POST create new investment (admin only)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      shortDesc,
      minAmount,
      targetAmount,
      returnRate,
      duration,
      category,
      featured
    } = req.body;

    // Validate required fields
    if (!title || !description || !minAmount || !returnRate || !duration || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const slug = createSlug(title);

    // Check if slug already exists
    const existingInvestment = await prisma.investment.findUnique({
      where: { slug }
    });

    if (existingInvestment) {
      return res.status(400).json({ error: 'An investment with this title already exists' });
    }

    const imageUrl = req.file ? `/uploads/investments/${req.file.filename}` : '';

    const investment = await prisma.investment.create({
      data: {
        title,
        slug,
        description,
        shortDesc: shortDesc || description.substring(0, 150),
        imageUrl,
        minAmount: parseFloat(minAmount),
        targetAmount: parseFloat(targetAmount),
        returnRate,
        duration,
        category,
        featured: featured === 'true',
        status: 'ACTIVE'
      }
    });

    res.status(201).json(investment);
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

// PUT update investment (admin only)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      shortDesc,
      minAmount,
      targetAmount,
      returnRate,
      duration,
      category,
      featured,
      status
    } = req.body;

    const existingInvestment = await prisma.investment.findUnique({
      where: { id }
    });

    if (!existingInvestment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const updateData = {
      title: title || existingInvestment.title,
      description: description || existingInvestment.description,
      shortDesc: shortDesc || existingInvestment.shortDesc,
      minAmount: minAmount ? parseFloat(minAmount) : existingInvestment.minAmount,
      targetAmount: targetAmount ? parseFloat(targetAmount) : existingInvestment.targetAmount,
      returnRate: returnRate || existingInvestment.returnRate,
      duration: duration || existingInvestment.duration,
      category: category || existingInvestment.category,
      featured: featured !== undefined ? featured === 'true' : existingInvestment.featured,
      status: status || existingInvestment.status
    };

    // Update slug if title changed
    if (title && title !== existingInvestment.title) {
      updateData.slug = createSlug(title);
    }

    // Update image if new one uploaded
    if (req.file) {
      // Delete old image
      if (existingInvestment.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', existingInvestment.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.imageUrl = `/uploads/investments/${req.file.filename}`;
    }

    const investment = await prisma.investment.update({
      where: { id },
      data: updateData
    });

    res.json(investment);
  } catch (error) {
    console.error('Error updating investment:', error);
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

// DELETE investment (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const investment = await prisma.investment.findUnique({
      where: { id },
      include: {
        applications: true,
        userInvestments: true
      }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    // Check if there are active user investments
    const activeInvestments = investment.userInvestments.filter(
      ui => ui.status === 'ACTIVE'
    );

    if (activeInvestments.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete investment with active user investments. Set status to CLOSED instead.' 
      });
    }

    // Delete image file
    if (investment.imageUrl) {
      const imagePath = path.join(__dirname, '..', investment.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.investment.delete({
      where: { id }
    });

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Error deleting investment:', error);
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});


export default router;