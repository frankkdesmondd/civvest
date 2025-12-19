import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to create notifications for all admins
const createAdminNotifications = async (title, message, type) => {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true
      }
    });

    // Create notification for each admin
    const notifications = admins.map(admin => ({
      userId: admin.id,
      title,
      message,
      type,
      read: false,
      createdAt: new Date()
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications
      });
      console.log(`Created ${notifications.length} admin notification(s)`);
    }
  } catch (error) {
    console.error('Error creating admin notifications:', error);
  }
};

// User requests withdrawal - UPDATED TO ALLOW PARTIAL WITHDRAWALS
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      userInvestmentId, 
      amount, 
      type,
      bankName,
      accountName,
      accountNumber,
      routingCode,
      coinHost,
      walletAddress 
    } = req.body;

    console.log('Withdrawal request received:', {
      userId,
      userInvestmentId,
      amount,
      type
    });

    // Validate user investment
    const investment = await prisma.userInvestment.findUnique({
      where: { id: userInvestmentId },
      include: { 
        investment: true, 
        user: true 
      }
    });

    if (!investment) {
      console.log('Investment not found:', userInvestmentId);
      return res.status(404).json({ error: 'Investment not found' });
    }

    if (investment.userId !== userId) {
      console.log('User not authorized for this investment');
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if investment can be withdrawn
    if (investment.status !== 'ACTIVE') {
      console.log('Investment not active:', investment.status);
      return res.status(400).json({ error: 'Investment is not active' });
    }

    if (!investment.startDate || !investment.endDate) {
      console.log('Investment dates not set');
      return res.status(400).json({ error: 'Investment not yet activated' });
    }

    const now = new Date();
    const endDate = new Date(investment.endDate);
    
    console.log('Checking maturity:', {
      now: now.toISOString(),
      endDate: endDate.toISOString(),
      isMatured: now >= endDate
    });

    if (now < endDate) {
      const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      return res.status(400).json({ 
        error: `Investment has not matured yet. Maturity date: ${endDate.toLocaleDateString()}`,
        daysRemaining
      });
    }

    // Validate withdrawal amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Withdrawal amount must be greater than 0' });
    }

    if (amount > investment.returnAmount) {
      return res.status(400).json({ 
        error: `Withdrawal amount exceeds available balance of $${investment.returnAmount.toLocaleString()}`
      });
    }

    // Validate withdrawal type details
    if (type === 'BANK_TRANSFER') {
      if (!bankName || !accountName || !accountNumber) {
        return res.status(400).json({ error: 'Missing bank details' });
      }
    } else if (type === 'CRYPTO_WALLET') {
      if (!coinHost || !walletAddress) {
        return res.status(400).json({ error: 'Missing wallet details' });
      }
    }

    // Check if there's already a pending withdrawal for this investment
    const existingWithdrawal = await prisma.withdrawal.findFirst({
      where: {
        userInvestmentId,
        status: 'PENDING'
      }
    });

    if (existingWithdrawal) {
      return res.status(400).json({ 
        error: 'You already have a pending withdrawal request for this investment'
      });
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        userInvestmentId,
        amount,
        type,
        bankName,
        accountName,
        accountNumber,
        routingCode,
        coinHost,
        walletAddress,
        status: 'PENDING'
      },
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
          include: {
            investment: true
          }
        }
      }
    });

    // Update investment status to PENDING_WITHDRAWAL to prevent multiple requests
    await prisma.userInvestment.update({
      where: { id: userInvestmentId },
      data: { status: 'PENDING_WITHDRAWAL' }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId,
        title: 'Withdrawal Request Submitted',
        message: `Your withdrawal request of $${amount.toLocaleString()} has been submitted and is pending admin approval.`,
        type: 'WITHDRAWAL',
        read: false
      }
    });

    // Create notifications for ALL admins
    await createAdminNotifications(
      'New Withdrawal Request',
      `${investment.user.firstName} ${investment.user.lastName} has requested a withdrawal of $${amount.toLocaleString()}. Investment: ${investment.investment.title}`,
      'WITHDRAWAL_ADMIN'
    );

    console.log('Withdrawal created successfully:', withdrawal.id);

    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      withdrawal,
      note: 'An admin will review and approve your request.'
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal request' });
  }
});

// Admin approve/reject withdrawal - UPDATED FOR PARTIAL WITHDRAWALS
router.put('/admin/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['APPROVED', 'REJECTED', 'PROCESSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: {
        user: true,
        investment: {
          include: {
            investment: true
          }
        }
      }
    });

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    const updateData = {
      status,
      adminNotes
    };

    if (status === 'APPROVED') {
      updateData.approvedById = req.user.userId;
      updateData.approvedAt = new Date();
    }

    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // If approved, update user balance
    if (status === 'APPROVED') {
      // Add the withdrawal amount to user's balance
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: {
          balance: {
            increment: withdrawal.amount
          }
        }
      });

      // Update investment based on whether it's a full or partial withdrawal
      const investment = await prisma.userInvestment.findUnique({
        where: { id: withdrawal.userInvestmentId }
      });

      if (investment) {
        // Calculate remaining balance after withdrawal
        const remainingBalance = investment.returnAmount - withdrawal.amount;
        
        if (remainingBalance <= 0) {
          // If all funds are withdrawn, mark investment as COMPLETED
          await prisma.userInvestment.update({
            where: { id: withdrawal.userInvestmentId },
            data: { 
              status: 'COMPLETED',
              returnAmount: 0 // Set to 0 since all funds are withdrawn
            }
          });
        } else {
          // If partial withdrawal, update returnAmount and keep investment ACTIVE
          await prisma.userInvestment.update({
            where: { id: withdrawal.userInvestmentId },
            data: { 
              status: 'ACTIVE', // Keep it active for further withdrawals
              returnAmount: remainingBalance
            }
          });
        }
      }

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Approved',
          message: `Your withdrawal request of $${withdrawal.amount.toLocaleString()} has been approved and funds have been added to your balance.`,
          type: 'WITHDRAWAL',
          read: false
        }
      });

      // Create notifications for other admins (except the one who approved)
      await createAdminNotifications(
        'Withdrawal Approved',
        `${req.user.firstName} ${req.user.lastName} approved a withdrawal of $${withdrawal.amount.toLocaleString()} for ${withdrawal.user.firstName} ${withdrawal.user.lastName}.`,
        'WITHDRAWAL_ADMIN'
      );

    } else if (status === 'REJECTED') {
      // If rejected, restore investment to active status
      await prisma.userInvestment.update({
        where: { id: withdrawal.userInvestmentId },
        data: { status: 'ACTIVE' }
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Rejected',
          message: `Your withdrawal request of $${withdrawal.amount.toLocaleString()} has been rejected. ${adminNotes ? 'Reason: ' + adminNotes : ''}`,
          type: 'WITHDRAWAL',
          read: false
        }
      });

      // Create notifications for other admins (except the one who rejected)
      await createAdminNotifications(
        'Withdrawal Rejected',
        `${req.user.firstName} ${req.user.lastName} rejected a withdrawal of $${withdrawal.amount.toLocaleString()} for ${withdrawal.user.firstName} ${withdrawal.user.lastName}. ${adminNotes ? 'Reason: ' + adminNotes : ''}`,
        'WITHDRAWAL_ADMIN'
      );
    }

    res.json({
      message: `Withdrawal ${status.toLowerCase()} successfully`,
      withdrawal: updatedWithdrawal
    });
  } catch (error) {
    console.error('Update withdrawal status error:', error);
    res.status(500).json({ error: 'Failed to update withdrawal status' });
  }
});

// Get user's withdrawal history
router.get('/my-withdrawals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      include: {
        investment: {
          include: {
            investment: {
              select: {
                title: true,
                category: true
              }
            }
          }
        },
        approvedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(withdrawals);
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

// Get all withdrawals (Admin only)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.query;
    
    const where = {};
    if (status) where.status = status;

    const withdrawals = await prisma.withdrawal.findMany({
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
          include: {
            investment: {
              select: {
                title: true,
                category: true
              }
            }
          }
        },
        approvedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(withdrawals);
  } catch (error) {
    console.error('Get all withdrawals error:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

// Get withdrawal statistics (Admin only)
router.get('/admin/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalWithdrawals = await prisma.withdrawal.count();
    const pendingWithdrawals = await prisma.withdrawal.count({
      where: { status: 'PENDING' }
    });
    const approvedWithdrawals = await prisma.withdrawal.count({
      where: { status: 'APPROVED' }
    });
    
    const totalAmount = await prisma.withdrawal.aggregate({
      _sum: { amount: true }
    });

    const approvedAmount = await prisma.withdrawal.aggregate({
      where: { status: 'APPROVED' },
      _sum: { amount: true }
    });

    res.json({
      totalWithdrawals,
      pendingWithdrawals,
      approvedWithdrawals,
      totalAmount: totalAmount._sum.amount || 0,
      approvedAmount: approvedAmount._sum.amount || 0
    });
  } catch (error) {
    console.error('Get withdrawal stats error:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawal statistics' });
  }
});

export default router;