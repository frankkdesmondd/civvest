import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accountNumber: true,
        balance: true,
        country: true,
        state: true,
        address: true,
        phone: true,
        referralCode: true,
        createdAt: true,
        // NEW: Bank details
        bankName: true,
        accountName: true,
        bankAccountNumber: true,
        routingCode: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's wallets
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/signup?ref=${user.referralCode}`;

    res.json({
      ...user,
      referralLink,
      wallets
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT update profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { country, state, address, phone, bankName, accountName, bankAccountNumber, routingCode } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        country,
        state,
        address,
        phone,
        bankName,
        accountName,
        bankAccountNumber,
        routingCode
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accountNumber: true,
        balance: true,
        country: true,
        state: true,
        address: true,
        phone: true,
        referralCode: true,
        bankName: true,
        accountName: true,
        bankAccountNumber: true,
        routingCode: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/wallets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { coinHost, walletAddress } = req.body;

    if (!coinHost || !walletAddress) {
      return res.status(400).json({ error: 'Coin host and wallet address are required' });
    }

    const wallet = await prisma.wallet.create({
      data: {
        userId,
        coinHost,
        walletAddress
      }
    });

    res.status(201).json({
      message: 'Wallet added successfully',
      wallet
    });
  } catch (error) {
    console.error('Add wallet error:', error);
    res.status(500).json({ error: 'Failed to add wallet' });
  }
});

// DELETE - Remove wallet
router.delete('/wallets/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const walletId = req.params.id;

    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    await prisma.wallet.delete({
      where: { id: walletId }
    });

    res.json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    console.error('Delete wallet error:', error);
    res.status(500).json({ error: 'Failed to delete wallet' });
  }
});

export default router;