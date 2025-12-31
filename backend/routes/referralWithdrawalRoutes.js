// routes/referralWithdrawalRoutes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// User requests referral bonus withdrawal
router.post('/request-referral', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
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
    res.status(500).json({
      error: 'Failed to process referral withdrawal request',
      details: error.message
    });
  }
});

// Check if referral withdrawal is available
router.get('/check-eligibility', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

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
    res.status(500).json({ error: 'Failed to check referral withdrawal eligibility' });
  }
});

// Get user's referral withdrawal history
router.get('/my-referral-withdrawals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const withdrawals = await prisma.referralWithdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(withdrawals);
  } catch (error) {
    console.error('[Referral Withdrawal] Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch referral withdrawal history' });
  }
});

// FIXED: Admin gets all referral withdrawal requests - SAFER VERSION
router.get('/admin/referral-requests', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log('[Admin] Fetching referral withdrawal requests...');
    console.log('[Admin] User making request:', { id: req.user.id, role: req.user.role });
    
    // First, try to get withdrawals WITHOUT approvedBy to avoid relation errors
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

    // Manually add approvedBy info if approvedById exists
    const withdrawalsWithApprover = await Promise.all(
      withdrawals.map(async (withdrawal) => {
        if (withdrawal.approvedById) {
          try {
            const approver = await prisma.user.findUnique({
              where: { id: withdrawal.approvedById },
              select: {
                firstName: true,
                lastName: true
              }
            });
            return {
              ...withdrawal,
              approvedBy: approver
            };
          } catch (err) {
            console.error('[Admin] Error fetching approver:', err);
            return withdrawal;
          }
        }
        return withdrawal;
      })
    );

    res.json(withdrawalsWithApprover);
  } catch (error) {
    console.error('[Admin] Fetch referral withdrawals error:', error);
    console.error('[Admin] Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch referral withdrawal requests',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin updates referral withdrawal status
router.put('/admin/referral/:withdrawalId/approve-reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, adminNotes } = req.body;

    console.log('[Admin] Processing referral withdrawal status update:', { withdrawalId, status, adminId: req.user.id });

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
          approvedById: req.user.id,
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
