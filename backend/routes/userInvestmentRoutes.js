// routes/userInvestmentRoutes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET all user investments for authenticated user
router.get('/my-investments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const investments = await prisma.userInvestment.findMany({
      where: { userId },
      include: {
        investment: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            category: true,
            returnRate: true,
            duration: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate additional info for each investment
   const investmentsWithDetails = investments.map(inv => ({
      ...inv,
      canWithdraw: inv.status === 'ACTIVE' && (inv.roiAmount || 0) > 0
    }));

    res.json(investmentsWithDetails);
  } catch (error) {
    console.error('Error fetching user investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// GET single user investment details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const investment = await prisma.userInvestment.findUnique({
      where: { id },
      include: {
        investment: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            accountNumber: true,
            balance: true
          }
        }
      }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    // Check authorization
    if (investment.userId !== userId && req.session?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Calculate additional details
    const now = new Date();
    const endDate = new Date(investment.endDate);
    const startDate = new Date(investment.startDate);
    const totalDuration = endDate - startDate;
    const elapsed = now - startDate;
    const progress = Math.min((elapsed / totalDuration) * 100, 100);
    const daysRemaining = Math.max(
      Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)),
      0
    );
    const isMatured = now >= endDate;

    res.json({
      ...investment,
      progress: Math.round(progress),
      daysRemaining,
      isMatured,
      canWithdraw: isMatured && investment.status === 'ACTIVE'
    });
  } catch (error) {
    console.error('Error fetching investment:', error);
    res.status(500).json({ error: 'Failed to fetch investment' });
  }
});

// POST - Request withdrawal (when maturity period reached)
// Update the withdraw route in userInvestmentRoutes.js to ensure it works correctly
router.post('/:id/withdraw', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const investment = await prisma.userInvestment.findUnique({
      where: { id },
      include: {
        user: true,
        investment: true
      }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    if (investment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (investment.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Investment is not active' });
    }

    // Check if investment has started (deposit was confirmed)
    if (!investment.startDate || !investment.endDate) {
      return res.status(400).json({ 
        error: 'Investment not yet activated. Please wait for admin to confirm your deposit.' 
      });
    }

    // Update user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: investment.returnAmount
        }
      }
    });

    // Update investment status
    await prisma.userInvestment.update({
      where: { id },
      data: {
        status: 'COMPLETED'
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Investment Withdrawal Successful',
        message: `Your investment in ${investment.investment.title} has been completed. $${investment.returnAmount.toLocaleString()} has been added to your account balance.`,
        type: 'WITHDRAWAL',
        read: false
      }
    });

    res.json({
      message: 'Withdrawal successful',
      withdrawnAmount: investment.returnAmount,
      newBalance: investment.user.balance + investment.returnAmount
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// GET investment statistics for user
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const investments = await prisma.userInvestment.findMany({
      where: { userId }
    });

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalReturns = investments
      .filter(inv => inv.status === 'COMPLETED')
      .reduce((sum, inv) => sum + inv.returnAmount, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'ACTIVE').length;
    const completedInvestments = investments.filter(inv => inv.status === 'COMPLETED').length;
    
    const expectedReturns = investments
      .filter(inv => inv.status === 'ACTIVE')
      .reduce((sum, inv) => sum + inv.returnAmount, 0);

    const profit = totalReturns - investments
      .filter(inv => inv.status === 'COMPLETED')
      .reduce((sum, inv) => sum + inv.amount, 0);

    res.json({
      totalInvested,
      totalReturns,
      activeInvestments,
      completedInvestments,
      expectedReturns,
      profit,
      totalInvestments: investments.length
    });
  } catch (error) {
    console.error('Error fetching investment stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET all user investments (admin only)
router.get('/admin/all', async (req, res) => {
  try {
    const { status, userId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const investments = await prisma.userInvestment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            accountNumber: true
          }
        },
        investment: {
          select: {
            id: true,
            title: true,
            category: true,
            returnRate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(investments);
  } catch (error) {
    console.error('Error fetching all investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// PUT - Update investment status (admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const investment = await prisma.userInvestment.findUnique({
      where: { id },
      include: { user: true, investment: true }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const updatedInvestment = await prisma.userInvestment.update({
      where: { id },
      data: { status }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: investment.userId,
        title: 'Investment Status Updated',
        message: `Your investment in ${investment.investment.title} status has been updated to ${status}`,
        type: 'STATUS_UPDATE',
        read: false
      }
    });

    res.json(updatedInvestment);
  } catch (error) {
    console.error('Error updating investment status:', error);
    res.status(500).json({ error: 'Failed to update investment status' });
  }
});


export default router;
