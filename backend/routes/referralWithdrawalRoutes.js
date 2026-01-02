// routes/referralWithdrawalRoutes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to get user ID with validation
const getUserId = (req) => {
  const userId = req.user?.userId || req.user?.id;
  
  if (!userId) {
    console.error('No user ID found in req.user:', req.user);
    throw new Error('User ID not found in authentication data');
  }
  
  return userId;
};

// User requests referral bonus withdrawal
router.post('/request-referral', authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { amount, type, bankDetails, walletDetails } = req.body;

    console.log('[Referral Withdrawal] Request:', { userId, amount, type });

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    // Validate type
    if (!type || !['BANK_TRANSFER', 'CRYPTO_WALLET'].includes(type)) {
      return res.status(400).json({ error: 'Valid withdrawal type required' });
    }

    // Validate details based on type
    if (type === 'BANK_TRANSFER') {
      if (!bankDetails?.bankName || !bankDetails?.accountName || !bankDetails?.accountNumber) {
        return res.status(400).json({ error: 'Complete bank details required' });
      }
    } else {
      if (!walletDetails?.coinHost || !walletDetails?.walletAddress) {
        return res.status(400).json({ error: 'Complete wallet details required' });
      }
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        referralBonus: true,
        referralCount: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has at least 10 referrals
    if (user.referralCount < 10) {
      return res.status(400).json({
        error: `You need at least 10 referrals to withdraw. Current referrals: ${user.referralCount}`,
        currentReferrals: user.referralCount,
        requiredReferrals: 10
      });
    }

    // Check if user has sufficient referral bonus
    const availableBonus = user.referralBonus || 0;
    if (availableBonus <= 0) {
      return res.status(400).json({
        error: 'No referral bonus available for withdrawal',
        availableBonus
      });
    }

    if (amount > availableBonus) {
      return res.status(400).json({
        error: `Insufficient referral bonus. Available: $${availableBonus.toFixed(2)}`,
        availableBonus,
        requestedAmount: amount
      });
    }

    // Create withdrawal request in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from referral bonus
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          referralBonus: {
            decrement: amount
          }
        }
      });

      // Create referral withdrawal record
      const withdrawal = await tx.referralWithdrawal.create({
        data: {
          userId: userId,
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

      // Create notification
      await tx.notification.create({
        data: {
          userId: userId,
          title: 'Referral Bonus Withdrawal Requested',
          message: `Withdrawal request for $${amount.toFixed(2)} from your referral bonus submitted. Pending approval.`,
          type: 'REFERRAL_WITHDRAWAL_REQUESTED'
        }
      });

      return { withdrawal, updatedUser };
    });

    console.log('[Referral Withdrawal] Success:', {
      withdrawalId: result.withdrawal.id,
      remainingBonus: result.updatedUser.referralBonus
    });

    res.json({
      success: true,
      message: 'Referral bonus withdrawal request submitted. Pending admin approval.',
      withdrawalId: result.withdrawal.id,
      remainingBonus: result.updatedUser.referralBonus
    });

  } catch (error) {
    console.error('[Referral Withdrawal] Error:', error);
    
    // Handle specific error cases
    if (error.message.includes('User ID not found')) {
      return res.status(401).json({
        error: 'Authentication error',
        message: 'Please log in again'
      });
    }
    
    res.status(500).json({
      error: 'Failed to process referral withdrawal request',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Check if referral withdrawal is available
router.get('/check-eligibility', authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralBonus: true,
        referralCount: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const canWithdraw = user.referralCount >= 10 && user.referralBonus > 0;
    const referralsNeeded = Math.max(0, 10 - user.referralCount);

    res.json({
      availableBonus: user.referralBonus,
      currentReferrals: user.referralCount,
      requiredReferrals: 10,
      referralsNeeded,
      canWithdraw,
      message: !canWithdraw
        ? user.referralCount < 10
          ? `You need ${referralsNeeded} more referral(s) to unlock withdrawal`
          : 'No referral bonus available'
        : 'Referral bonus available for withdrawal'
    });
  } catch (error) {
    console.error('[Referral Withdrawal] Check eligibility error:', error);
    
    // Handle specific error cases
    if (error.message.includes('User ID not found')) {
      return res.status(401).json({ 
        error: 'Authentication error',
        message: 'Please log in again'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to check referral withdrawal eligibility',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user's referral withdrawal history
router.get('/my-referral-withdrawals', authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);

    const withdrawals = await prisma.referralWithdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(withdrawals);
  } catch (error) {
    console.error('[Referral Withdrawal] Get history error:', error);
    
    // Handle specific error cases
    if (error.message.includes('User ID not found')) {
      return res.status(401).json({ 
        error: 'Authentication error',
        message: 'Please log in again'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch referral withdrawal history',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Admin gets all referral withdrawal requests
router.get('/admin/referral-requests', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log('[Admin] Fetching referral withdrawal requests...');
    
    // FIX: Use a simpler query without the problematic relation
    const withdrawals = await prisma.referralWithdrawal.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            accountNumber: true,
            referralCount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[Admin] Found ${withdrawals.length} referral withdrawals`);

    // Transform the data to include approver info safely
    const withdrawalsWithApprover = withdrawals.map(withdrawal => {
      const result = {
        ...withdrawal,
        approvedBy: null
      };
      
      // Only include approvedBy if it exists and is valid
      if (withdrawal.approvedById) {
        // We'll handle this differently - maybe fetch separately
        result.approvedById = withdrawal.approvedById;
      }
      
      return result;
    });

    res.json(withdrawalsWithApprover);
  } catch (error) {
    console.error('[Admin] Fetch referral withdrawals error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch referral withdrawal requests',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Admin updates referral withdrawal status
router.put('/admin/referral/:withdrawalId/approve-reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, adminNotes } = req.body;

    console.log('[Admin] Processing referral withdrawal status update:', { withdrawalId, status, adminId: req.user.userId });

    if (!['APPROVED', 'REJECTED', 'PROCESSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get existing withdrawal
      const existingWithdrawal = await tx.referralWithdrawal.findUnique({
        where: { id: withdrawalId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              referralBonus: true,
              referralCount: true
            }
          }
        }
      });

      if (!existingWithdrawal) {
        throw new Error('Withdrawal not found');
      }

      if (existingWithdrawal.status !== 'PENDING') {
        throw new Error('Withdrawal already processed');
      }

      // Update withdrawal status
      const withdrawal = await tx.referralWithdrawal.update({
        where: { id: withdrawalId },
        data: {
          status,
          adminNotes,
          approvedById: req.user.userId,
          approvedAt: status === 'APPROVED' ? new Date() : null
        }
      });

      // If rejected, refund the amount back to referral bonus
      if (status === 'REJECTED') {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: {
            referralBonus: {
              increment: withdrawal.amount
            }
          }
        });
      }

      // Create notification
      await tx.notification.create({
        data: {
          userId: withdrawal.userId,
          title: status === 'APPROVED'
            ? 'Referral Bonus Withdrawal Approved'
            : 'Referral Bonus Withdrawal Rejected',
          message: status === 'APPROVED'
            ? `Your referral bonus withdrawal of $${withdrawal.amount.toFixed(2)} has been approved.`
            : `Your referral bonus withdrawal request has been rejected. ${adminNotes || 'Please contact support for details.'}`,
          type: status === 'APPROVED' ? 'REFERRAL_WITHDRAWAL_APPROVED' : 'REFERRAL_WITHDRAWAL_REJECTED'
        }
      });

      return withdrawal;
    });

    console.log('[Admin] Referral withdrawal status updated successfully');

    res.json({
      ...result,
      message: status === 'APPROVED'
        ? 'Referral withdrawal approved'
        : status === 'REJECTED'
        ? 'Referral withdrawal rejected and amount refunded'
        : 'Referral withdrawal processed'
    });

  } catch (error) {
    console.error('[Admin] Update referral withdrawal status error:', error);
    res.status(500).json({
      error: 'Failed to update referral withdrawal status',
      details: error.message
    });
  }
});

export default router;
