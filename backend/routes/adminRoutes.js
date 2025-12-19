// routes/adminRoutes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (Admin only)
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accountNumber: true,
        balance: true,
        roi: true,              // Make sure this is here
        referralBonus: true,
        createdAt: true,
        _count: {
          select: { userInvestments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user details (Admin only)
router.get('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accountNumber: true,
        balance: true,
        createdAt: true,
        userInvestments: {
          include: {
            userInvestment: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user balance (Admin only)
router.put('/users/:id/balance', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { balance, action } = req.body; // action: 'SET', 'ADD', 'SUBTRACT'
    const userId = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let newBalance;
    let message;

    switch (action) {
      case 'SET':
        newBalance = parseFloat(balance);
        message = `Your account balance has been updated to $${newBalance.toFixed(2)}`;
        break;
      case 'ADD':
        newBalance = user.balance + parseFloat(balance);
        message = `$${parseFloat(balance).toFixed(2)} has been added to your account`;
        break;
      case 'SUBTRACT':
        newBalance = user.balance - parseFloat(balance);
        message = `$${parseFloat(balance).toFixed(2)} has been deducted from your account`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Update user balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId,
        title: 'Balance Update',
        message,
        type: 'ACCOUNT'
      }
    });

    res.json({
      message: 'Balance updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        balance: updatedUser.balance
      }
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

// Get dashboard stats (Admin only)
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    const totalInvestments = await prisma.investment.count();
    const totalUserInvestments = await prisma.userInvestment.count();
    
    const totalInvestedAmount = await prisma.userInvestment.aggregate({
      _sum: { amount: true }
    });

    const recentUsers = await prisma.user.findMany({
      where: { role: 'USER' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });

    res.json({
      totalUsers,
      totalInvestments,
      totalUserInvestments,
      totalInvestedAmount: totalInvestedAmount._sum.amount || 0,
      recentUsers
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists and is not an admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Delete user's notifications first
    await prisma.notification.deleteMany({
      where: { userId }
    });

    // Delete user's investments
    await prisma.userInvestment.deleteMany({
      where: { userId }
    });

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all investments with analytics (Admin only)
router.get('/investments/analytics', authenticateToken, isAdmin, async (req, res) => {
  try {
    const investments = await prisma.investment.findMany({
      include: {
        _count: {
          select: { userInvestments: true }
        }
      }
    });

    const analytics = await Promise.all(
      investments.map(async (investment) => {
        const totalInvested = await prisma.userInvestment.aggregate({
          where: { investmentId: investment.id },
          _sum: { amount: true }
        });

        return {
          ...investment,
          totalInvestors: investment._count.userInvestments,
          totalInvested: totalInvested._sum.amount || 0
        };
      })
    );

    res.json(analytics);
  } catch (error) {
    console.error('Get investment analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get recent activities (Admin only)
router.get('/recent-activities', authenticateToken, isAdmin, async (req, res) => {
  try {
    const recentInvestments = await prisma.userInvestment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        investment: {
          select: {
            title: true
          }
        }
      }
    });

    const recentUsers = await prisma.user.findMany({
      where: { role: 'USER' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        balance: true
      }
    });

    res.json({
      recentInvestments,
      recentUsers
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

router.put('/users/:id/roi', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { roi } = req.body;
    const userId = req.params.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roi: parseFloat(roi) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accountNumber: true,
        balance: true,
        roi: true,
        referralBonus: true,
        createdAt: true,
        _count: {
          select: { userInvestments: true }
        }
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'ROI Updated',
        message: `Your ROI has been updated to $${Math.floor(parseFloat(roi))}`,
        type: 'ACCOUNT'
      }
    });

    res.json({ 
      message: 'ROI updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update ROI error:', error);
    res.status(500).json({ error: 'Failed to update ROI' });
  }
});

export default router;