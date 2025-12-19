import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

const WALLET_ADDRESSES = {
  ETH: '0x8aa76b08440fca7b415f2a5a51c9599537f6e1fc',
  TRON: 'TSQgN3ji7PUdDSdVeZQzitDnMKT3LcG1Hq'
};

// Configure multer for receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/deposit-receipts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg, and .pdf files are allowed!'));
    }
  }
});

// GET wallet addresses
router.get('/wallets', (req, res) => {
  res.json(WALLET_ADDRESSES);
});

// POST - Create deposit request with receipt
router.post('/', authenticateToken, upload.single('receipt'), async (req, res) => {
  try {
    const { investmentId, amount, network } = req.body;
    const userId = req.user.userId;

    // Check if receipt was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Receipt upload is required' });
    }

    if (!['ETH', 'TRON'].includes(network)) {
      return res.status(400).json({ error: 'Invalid network' });
    }

    const investment = await prisma.investment.findUnique({
      where: { id: investmentId }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const investmentAmount = parseFloat(amount);
    if (investmentAmount < investment.minAmount) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        error: `Minimum deposit amount is $${investment.minAmount.toLocaleString()}` 
      });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true }
    });

    const deposit = await prisma.deposit.create({
      data: {
        userId,
        investmentId,
        amount: investmentAmount,
        network,
        receiptUrl: `/uploads/deposit-receipts/${req.file.filename}`,
        status: 'PENDING'
      },
      include: {
        investment: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId,
        title: 'Deposit Request Submitted',
        message: `Your deposit of $${amount} for ${investment.title} is pending confirmation.`,
        type: 'DEPOSIT'
      }
    });

    // Create notification for ALL admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Deposit Request',
          message: `${user.firstName} ${user.lastName} submitted a deposit of $${investmentAmount.toLocaleString()} for ${investment.title} via ${network} network.`,
          type: 'ADMIN_DEPOSIT'
        }
      });
    }

    res.status(201).json({
      message: 'Deposit request submitted successfully',
      deposit
    });
  } catch (error) {
    console.error('Create deposit error:', error);
    // Delete uploaded file if database operation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to create deposit' });
  }
});

// GET user's deposits
router.get('/my-deposits', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const deposits = await prisma.deposit.findMany({
      where: { userId },
      include: {
        investment: {
          select: {
            title: true,
            returnRate: true,
            duration: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(deposits);
  } catch (error) {
    console.error('Get deposits error:', error);
    res.status(500).json({ error: 'Failed to fetch deposits' });
  }
});

// GET all deposits (admin only)
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = {};
    if (status) where.status = status;

    const deposits = await prisma.deposit.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            accountNumber: true
          }
        },
        investment: {
          select: {
            title: true,
            returnRate: true,
            duration: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(deposits);
  } catch (error) {
    console.error('Get all deposits error:', error);
    res.status(500).json({ error: 'Failed to fetch deposits' });
  }
});

// UPDATED: Helper function to calculate end date with support for minutes, hours, days, weeks, months, years
function calculateEndDate(duration) {
  const now = new Date();
  
  // Parse various duration formats (case-insensitive)
  const match = duration.toLowerCase().match(/(\d+)\s*(second|sec|minute|min|hour|hr|day|week|month|year)s?/i);
  
  if (!match) {
    console.warn(`Could not parse duration: "${duration}", defaulting to 6 months`);
    return new Date(now.setMonth(now.getMonth() + 6));
  }
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  const endDate = new Date(now);
  
  switch(unit) {
    case 'second':
    case 'sec':
      endDate.setSeconds(now.getSeconds() + value);
      break;
    
    case 'minute':
    case 'min':
      endDate.setMinutes(now.getMinutes() + value);
      break;
    
    case 'hour':
    case 'hr':
      endDate.setHours(now.getHours() + value);
      break;
    
    case 'day':
      endDate.setDate(now.getDate() + value);
      break;
    
    case 'week':
      endDate.setDate(now.getDate() + (value * 7));
      break;
    
    case 'month':
      endDate.setMonth(now.getMonth() + value);
      break;
    
    case 'year':
      endDate.setFullYear(now.getFullYear() + value);
      break;
    
    default:
      console.warn(`Unknown unit: "${unit}" in duration: "${duration}", defaulting to 6 months`);
      endDate.setMonth(now.getMonth() + 6);
  }
  
  return endDate;
}

// Helper function to calculate return amount
function calculateReturnAmount(amount, returnRate) {
  const rate = parseFloat(returnRate.replace('%', '')) / 100;
  return amount * (1 + rate);
}

// PUT - Confirm/Reject deposit (admin only)
router.put('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // CONFIRMED or REJECTED

    if (!['CONFIRMED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: {
        user: true,
        investment: true
      }
    });

    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    if (deposit.status !== 'PENDING') {
      return res.status(400).json({ error: 'Deposit already processed' });
    }

    // Update deposit status
    const updatedDeposit = await prisma.deposit.update({
      where: { id },
      data: { status }
    });

    if (status === 'CONFIRMED') {
      // Update user balance
      await prisma.user.update({
        where: { id: deposit.userId },
        data: {
          balance: {
            increment: deposit.amount
          }
        }
      });

      // Calculate dates and return
      const startDate = new Date();
      const endDate = calculateEndDate(deposit.investment.duration);
      const returnAmount = calculateReturnAmount(deposit.amount, deposit.investment.returnRate);

      // Debug logging to see what's happening
      console.log('=== Deposit Confirmation Debug ===');
      console.log('Investment duration:', deposit.investment.duration);
      console.log('Start date:', startDate);
      console.log('Calculated end date:', endDate);
      console.log('Return amount:', returnAmount);
      console.log('===============================');

      // Create or update UserInvestment
      await prisma.userInvestment.create({
        data: {
          userId: deposit.userId,
          investmentId: deposit.investmentId,
          amount: deposit.amount,
          returnAmount,
          startDate,
          endDate,
          status: 'ACTIVE',
          depositId: deposit.id
        }
      });

      // Update investment current amount
      await prisma.investment.update({
        where: { id: deposit.investmentId },
        data: {
          currentAmount: {
            increment: deposit.amount
          }
        }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: deposit.userId,
          title: 'Deposit Confirmed',
          message: `Your deposit of $${deposit.amount.toLocaleString()} has been confirmed. Your investment in ${deposit.investment.title} is now active!`,
          type: 'DEPOSIT'
        }
      });
    } else {
      // Create rejection notification
      await prisma.notification.create({
        data: {
          userId: deposit.userId,
          title: 'Deposit Rejected',
          message: `Your deposit of $${deposit.amount.toLocaleString()} for ${deposit.investment.title} was not confirmed. Please contact support.`,
          type: 'DEPOSIT'
        }
      });
    }

    res.json({
      message: `Deposit ${status.toLowerCase()} successfully`,
      deposit: updatedDeposit
    });
  } catch (error) {
    console.error('Update deposit status error:', error);
    res.status(500).json({ error: 'Failed to update deposit status' });
  }
});

export default router;