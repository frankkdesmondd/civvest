import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// User requests ROI withdrawal
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { userInvestmentId, amount, type, bankDetails, walletDetails } = req.body;

    console.log('[Withdrawal] Request:', { userId, userInvestmentId, amount, type });

    if (!userInvestmentId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid investment ID and amount required' });
    }

    if (!type || !['BANK_TRANSFER', 'CRYPTO_WALLET'].includes(type)) {
      return res.status(400).json({ error: 'Valid withdrawal type required' });
    }

    if (type === 'BANK_TRANSFER') {
      if (!bankDetails?.bankName || !bankDetails?.accountName || !bankDetails?.accountNumber) {
        return res.status(400).json({ error: 'Complete bank details required' });
      }
    } else {
      if (!walletDetails?.coinHost || !walletDetails?.walletAddress) {
        return res.status(400).json({ error: 'Complete wallet details required' });
      }
    }

    // Fetch the user investment from database
    const userInvestment = await prisma.userInvestment.findFirst({
      where: { 
        id: userInvestmentId, 
        userId: userId, 
        status: 'ACTIVE' 
      },
      include: {
        user: {
          select: { id: true, roi: true, firstName: true, lastName: true, email: true }
        },
        investment: {
          select: { title: true, category: true, returnRate: true, duration: true }
        }
      }
    });

    if (!userInvestment) {
      return res.status(404).json({ error: 'Active investment not found' });
    }

    // Check ROI amount
    const availableROI = userInvestment.roiAmount || 0;
    if (availableROI <= 0) {
      return res.status(400).json({ 
        error: 'No ROI available. Admin has not added ROI yet.',
        investmentId: userInvestmentId,
        currentROI: availableROI
      });
    }

    if (amount > availableROI) {
      return res.status(400).json({ 
        error: `Insufficient ROI. Available: $${availableROI.toFixed(2)}`,
        availableROI,
        requestedAmount: amount
      });
    }

    // Process withdrawal transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedInvestment = await tx.userInvestment.update({
        where: { id: userInvestmentId },
        data: { 
          roiAmount: { decrement: amount },
          ...(userInvestment.roiAmount - amount <= 0 && { status: 'COMPLETED' })
         }
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { roi: { decrement: amount } }
      });

      await tx.ROITransaction.create({
        data: {
          userId: userId,
          userInvestmentId: userInvestmentId,
          amount: amount,
          type: 'WITHDRAWAL',
          previousRoiAmount: userInvestment.roiAmount,
          newRoiAmount: updatedInvestment.roiAmount,
          previousUserRoi: userInvestment.user.roi,
          newUserRoi: updatedUser.roi,
          notes: 'ROI withdrawal request'
        }
      });

      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: userId,
          userInvestmentId: userInvestmentId,
          amount: amount,
          type: type,
          status: 'PENDING',
          bankName: bankDetails?.bankName,
          accountName: bankDetails?.accountName,
          accountNumber: bankDetails?.accountNumber,
          routingCode: bankDetails?.routingCode,
          coinHost: walletDetails?.coinHost,
          walletAddress: walletDetails?.walletAddress
        }
      });

      // 1. Create notification for USER
      await tx.notification.create({
        data: {
          userId: userId,
          title: 'ROI Withdrawal Requested',
          message: `Withdrawal request for $${amount.toFixed(2)} from ${userInvestment.investment.title} submitted. Pending approval.`,
          type: 'WITHDRAWAL_REQUESTED'
        }
      });

      // 2. Find all ADMIN users and create notifications for them
      // REMOVED metadata field since it doesn't exist in your schema
      const adminUsers = await tx.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      });
      
      // Create notifications for each admin
      if (adminUsers.length > 0) {
        const adminNotifications = adminUsers.map(admin => ({
          userId: admin.id,
          title: 'New Withdrawal Request',
          message: `${userInvestment.user.firstName} ${userInvestment.user.lastName} requested $${amount.toFixed(2)} withdrawal from ${userInvestment.investment.title}.`,
          type: 'NEW_WITHDRAWAL_REQUEST'
          // REMOVED: metadata field
        }));
        
        await tx.notification.createMany({
          data: adminNotifications
        });
      }

      return { withdrawal, updatedInvestment, updatedUser };
    });

    console.log('[Withdrawal] Success:', {
      withdrawalId: result.withdrawal.id,
      remainingROI: result.updatedInvestment.roiAmount
    });

    res.json({
      success: true,
      message: 'ROI withdrawal request submitted. Pending admin approval.',
      withdrawalId: result.withdrawal.id,
      remainingROI: result.updatedInvestment.roiAmount,
      userTotalROI: result.updatedUser.roi
    });

  } catch (error) {
    console.error('[Withdrawal] Error:', error);
    res.status(500).json({ 
      error: 'Failed to process withdrawal request',
      details: error.message 
    });
  }
});

// Check if ROI withdrawal is available (No maturity restrictions)
router.get('/roi-available/:investmentId', authenticateToken, async (req, res) => {
  try {
    const { investmentId } = req.params;
    const userId = req.user.id;

    const investment = await prisma.userInvestment.findFirst({
      where: {
        id: investmentId,
        userId: userId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        roiAmount: true,
        investment: {
          select: {
            title: true
          }
        }
      }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const canWithdraw = investment.roiAmount > 0;
    
    res.json({
      investmentId: investment.id,
      investmentTitle: investment.investment.title,
      availableROI: investment.roiAmount,
      canWithdraw,
      message: investment.roiAmount <= 0
        ? 'No ROI available'
        : 'ROI available for withdrawal'
    });
  } catch (error) {
    console.error('[Withdrawal] Check ROI available error:', error);
    res.status(500).json({ error: 'Failed to check ROI availability' });
  }
});

// Get user's ROI withdrawal history
router.get('/my-roi-withdrawals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        userId,
        userInvestmentId: { not: null }
      },
      include: {
        investment: {
          include: {
            investment: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(withdrawals);
  } catch (error) {
    console.error('Get ROI withdrawals error:', error);
    res.status(500).json({ error: 'Failed to fetch ROI withdrawals' });
  }
});

// Admin gets all withdrawal requests
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        investment: {
          include: {
            investment: {
              select: { title: true, category: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(withdrawals);
  } catch (error) {
    console.error('Admin fetch withdrawals error:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawal requests' });
  }
});

// Admin updates withdrawal status
router.put('/admin/:withdrawalId/status', authenticateToken, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, adminNotes } = req.body;

    // Validate the status
    if (!['APPROVED', 'REJECTED', 'PROCESSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Update withdrawal status
      const withdrawal = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status,
          adminNotes,
          approvedById: req.user.id,
          approvedAt: status === 'APPROVED' ? new Date() : null
        },
        include: {
          investment: true, // This includes the UserInvestment
          user: {
            select: {
              id: true,
              balance: true,
              roi: true
            }
          }
        }
      });

      // 2. If approved, process the balance/ROI update and check if investment should be marked as COMPLETED
      if (status === 'APPROVED') {
        // Update user balance (assuming this is a regular withdrawal, not ROI withdrawal)
        // You might need to adjust this based on your withdrawal type
        const updatedUser = await tx.user.update({
          where: { id: withdrawal.userId },
          data: { 
            balance: { decrement: withdrawal.amount }
          }
        });

        // 3. If this is an ROI withdrawal (has userInvestmentId), check ROI and mark as COMPLETED if needed
        if (withdrawal.userInvestmentId && withdrawal.investment) {
          const currentInvestment = await tx.userInvestment.findUnique({
            where: { id: withdrawal.userInvestmentId }
          });
          
          // If ROI amount is zero or negative, mark as COMPLETED and set withdrawalStatus to PROCESSED
          if (currentInvestment && currentInvestment.roiAmount <= 0) {
            // FIXED: Use enum value PROCESSED (without quotes) for withdrawalStatus
            await tx.userInvestment.update({
              where: { id: withdrawal.userInvestmentId },
              data: { 
                status: 'COMPLETED',
                withdrawalStatus: 'PROCESSED' // This is correct - it matches your WithdrawalStatus enum
              }
            });
          }
        }

        // Return updated user info for frontend
        return {
          withdrawal,
          userId: withdrawal.user.id,
          newBalance: updatedUser.balance
        };
      }

      return { withdrawal };
    });

    // Send appropriate response based on status
    if (status === 'APPROVED') {
      res.json({
        success: true,
        message: 'Withdrawal approved successfully',
        withdrawal: result.withdrawal,
        userId: result.userId,
        newBalance: result.newBalance
      });
    } else if (status === 'REJECTED') {
      res.json({
        success: true,
        message: 'Withdrawal rejected',
        withdrawal: result.withdrawal
      });
    } else if (status === 'PROCESSED') {
      res.json({
        success: true,
        message: 'Withdrawal marked as processed',
        withdrawal: result.withdrawal
      });
    } else {
      res.json({
        success: true,
        message: 'Withdrawal status updated',
        withdrawal: result.withdrawal
      });
    }
    
  } catch (error) {
    console.error('Update withdrawal status error:', error);
    res.status(500).json({ 
      error: 'Failed to update withdrawal status',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// Get user's withdrawal history (all types)
router.get('/my-withdrawals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      include: {
        investment: {
          include: {
            investment: {
              select: { title: true }
            }
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

export default router;

