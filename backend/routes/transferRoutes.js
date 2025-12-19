import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Submit transfer
router.post('/', authenticateToken, upload.single('receipt'), async (req, res) => {
  try {
    const { amount, accountNumber, bankName } = req.body;
    const userId = req.user.userId;
    const receiptUrl = req.file ? `/uploads/receipts/${req.file.filename}` : '';

    const transfer = await prisma.transfer.create({
      data: {
        userId,
        amount: parseFloat(amount),
        receiptUrl,
        accountNumber,
        bankName,
        status: 'PENDING'
      }
    });

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Failed to submit transfer' });
  }
});

// Get user transfers
router.get('/my-transfers', authenticateToken, async (req, res) => {
  try {
    const transfers = await prisma.transfer.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

// Get all transfers (Admin)
router.get('/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

// Update transfer status (Admin)
router.put('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const transferId = req.params.id;

    const transfer = await prisma.transfer.update({
      where: { id: transferId },
      data: { status },
      include: { user: true }
    });

    // If approved, add to user balance
    if (status === 'COMPLETED') {
      await prisma.user.update({
        where: { id: transfer.userId },
        data: {
          balance: {
            increment: transfer.amount
          }
        }
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: transfer.userId,
          title: 'Transfer Approved',
          message: `Your transfer of $${transfer.amount.toFixed(2)} has been approved and added to your balance`,
          type: 'ACCOUNT'
        }
      });
    }

    res.json(transfer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transfer' });
  }
});

export default router;