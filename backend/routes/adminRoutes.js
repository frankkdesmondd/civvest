// routes/adminRoutes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Debug middleware for ALL admin routes
router.use((req, res, next) => {
  console.log(`[ADMIN ROUTE] ${req.method} ${req.originalUrl}`);
  console.log(`[ADMIN ROUTE] Path: ${req.path}`);
  console.log(`[ADMIN ROUTE] Base URL: ${req.baseUrl}`);
  next();
});

// Test route to verify admin routes are working
router.get('/test-route', (req, res) => {
  res.json({
    message: 'Admin routes are working!',
    timestamp: new Date().toISOString(),
    path: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl
  });
});

router.get('/test-investments', (req, res) => {
  res.json({ message: 'Investments route is accessible' });
});

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

router.get('/users/:userId/investments', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`[ROI Edit] Fetching investments for user ${userId}`);
    
    const investments = await prisma.userInvestment.findMany({
      where: { 
        userId: userId,
        status: 'ACTIVE'
      },
      include: {
        investment: {
          select: {
            id: true,
            title: true,
            category: true,
            returnRate: true,
            duration: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedInvestments = investments.map(inv => {
      const daysRemaining = inv.endDate ? 
        Math.ceil((new Date(inv.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 
        null;
      
      return {
        id: inv.id,
        userId: inv.userId,
        amount: inv.amount,
        returnAmount: inv.returnAmount,
        roiAmount: inv.roiAmount || 0,
        totalRoiAdded: inv.totalRoiAdded || 0,
        status: inv.status,
        startDate: inv.startDate,
        endDate: inv.endDate,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        investment: inv.investment,
        daysRemaining,
        isMatured: daysRemaining !== null && daysRemaining <= 0
      };
    });

    console.log(`[ROI Edit] Found ${formattedInvestments.length} active investments`);
    
    res.json(formattedInvestments);
    
  } catch (error) {
    console.error('[ROI Edit] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user investments',
      details: error.message 
    });
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

router.get('/recent-activities', authenticateToken, isAdmin, async (req, res) => {
  try {
    const recentInvestments = await prisma.userInvestment.findMany({
      take: 100, // Increased to get all investments
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            accountNumber: true,
            roi: true
          }
        },
        investment: {
          select: {
            title: true,
            category: true,
            returnRate: true
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

router.post('/investments/:investmentId/add-roi', authenticateToken, isAdmin, async (req, res) => {
  console.log('=== ADD ROI ROUTE CALLED ===');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  
  try {
    const { investmentId } = req.params;
    const { roiAmount, userId } = req.body;
    const adminId = req.user?.id;

    if (!roiAmount || roiAmount <= 0) {
      return res.status(400).json({ error: 'Valid ROI amount is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find the user investment with user data
    const userInvestment = await prisma.userInvestment.findFirst({
      where: {
        id: investmentId,
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            roi: true,
            firstName: true,
            lastName: true,
            accountNumber: true,
            email: true
          }
        },
        investment: {
          select: {
            title: true,
            category: true
          }
        }
      }
    });

    if (!userInvestment) {
      return res.status(404).json({ error: 'Investment not found for this user' });
    }

    // Update investment ROI
    const updatedInvestment = await prisma.userInvestment.update({
      where: { id: investmentId },
      data: {
        roiAmount: {
          increment: parseFloat(roiAmount)
        },
        totalRoiAdded: {
          increment: parseFloat(roiAmount)
        }
      }
    });

    // Update user's total ROI
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roi: {
          increment: parseFloat(roiAmount)
        }
      },
      select: {
        id: true,
        roi: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    // Create ROI transaction record
    await prisma.roiTransaction.create({
      data: {
        userId: userId,
        userInvestmentId: investmentId,
        amount: parseFloat(roiAmount),
        type: 'ADDITION',
        adminId: adminId,
        previousRoiAmount: userInvestment.roiAmount || 0,
        newRoiAmount: updatedInvestment.roiAmount,
        previousUserRoi: userInvestment.user.roi || 0,
        newUserRoi: updatedUser.roi
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: userId,
        title: 'ROI Added to Investment',
        message: `$${parseFloat(roiAmount).toFixed(2)} ROI has been added to your ${userInvestment.investment.title} investment. Your total available ROI is now $${updatedUser.roi.toFixed(2)}`,
        type: 'ROI_ADDED'
      }
    });

    res.json({
      success: true,
      message: `Successfully added $${parseFloat(roiAmount).toFixed(2)} ROI`,
      investment: {
        id: updatedInvestment.id,
        roiAmount: updatedInvestment.roiAmount,
        totalRoiAdded: updatedInvestment.totalRoiAdded
      },
      updatedTotalROI: updatedUser.roi
    });

  } catch (error) {
    console.error('Add ROI error:', error);
    res.status(500).json({ error: 'Failed to add ROI to investment' });
  }
});


// GET /api/admin/users/:userId/investments-with-roi
router.get('/users/:userId/investments-with-roi', async (req, res) => {
  try {
    const { userId } = req.params;

    const investments = await prisma.userInvestment.findMany({
      where: { userId: userId },
      include: {
        investment: {
          select: {
            title: true,
            category: true,
            returnRate: true
          }
        },
        roiTransactions: {
          where: { type: 'ADDITION' },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate totals
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalROI = investments.reduce((sum, inv) => sum + inv.roiAmount, 0);
    const totalRoiAdded = investments.reduce((sum, inv) => sum + inv.totalRoiAdded, 0);

    res.json({
      investments,
      totals: {
        totalInvested,
        totalROI,
        totalRoiAdded,
        investmentCount: investments.length
      }
    });

  } catch (error) {
    console.error('Get investments with ROI error:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// GET /api/admin/roi-transactions
router.get('/roi-transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = userId ? { userId } : {};

    const [transactions, total] = await Promise.all([
      prisma.roiTransaction.findMany({
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
          userInvestment: {
            include: {
              investment: {
                select: {
                  title: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: parseInt(limit)
      }),
      prisma.roiTransaction.count({ where })
    ]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get ROI transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch ROI transactions' });
  }
});

// GET /api/admin/user-investments/all - Fetch ALL user investments with complete data
router.get('/user-investments/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log('Fetching all user investments with full user data...');
    
    const userInvestments = await prisma.userInvestment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            accountNumber: true,  // Make sure this is included
            roi: true,
            balance: true,
            phone: true,
            createdAt: true
          }
        },
        investment: {
          select: {
            id: true,
            title: true,
            category: true,
            returnRate: true,
            duration: true,
            minAmount: true
          }
        },
        roiTransactions: {
          where: { type: 'ADDITION' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            amount: true,
            createdAt: true,
            notes: true,
            previousRoiAmount: true,
            newRoiAmount: true
          }
        }
      }
    });

    console.log(`Found ${userInvestments.length} user investments`);
    
    // Log first investment to verify data structure
    if (userInvestments.length > 0) {
      console.log('Sample investment data:', {
        id: userInvestments[0].id,
        hasUser: !!userInvestments[0].user,
        userId: userInvestments[0].user?.id,
        accountNumber: userInvestments[0].user?.accountNumber,
        hasInvestment: !!userInvestments[0].investment
      });
    }
    
    // Validate data before sending
    const validatedInvestments = userInvestments.map(inv => {
      // Ensure accountNumber is never null/undefined
      if (inv.user && !inv.user.accountNumber) {
        console.warn(`User ${inv.user.id} has no account number`);
      }
      
      return {
        ...inv,
        user: inv.user ? {
          ...inv.user,
          accountNumber: inv.user.accountNumber || 'Not Set'  // Provide fallback
        } : null
      };
    });

    // Filter out investments without valid user data
    const finalInvestments = validatedInvestments.filter(inv => {
      const isValid = inv.user && inv.user.id && inv.investment && inv.investment.title;
      if (!isValid) {
        console.warn('Filtering out invalid investment:', {
          id: inv.id,
          hasUser: !!inv.user,
          hasUserId: !!inv.user?.id,
          hasInvestment: !!inv.investment
        });
      }
      return isValid;
    });

    console.log(`Returning ${finalInvestments.length} valid investments`);
    res.json(finalInvestments);
    
  } catch (error) {
    console.error('Get all user investments error:', error);
    res.status(500).json({ error: 'Failed to fetch user investments', details: error.message });
  }
});

router.put('/user-investments/:investmentId/roi', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { roiAmount } = req.body;
    
    console.log(`[ROI Update] Starting update for investment ${investmentId}`);
    console.log(`[ROI Update] New ROI amount: ${roiAmount}`);
    
    // Validate ROI amount
    if (roiAmount === undefined || roiAmount === null || isNaN(parseFloat(roiAmount)) || parseFloat(roiAmount) < 0) {
      console.error('[ROI Update] Invalid ROI amount:', roiAmount);
      return res.status(400).json({ error: 'Valid ROI amount required (must be >= 0)' });
    }

    // Find the investment
    const investment = await prisma.userInvestment.findUnique({
  where: { id: investmentId },
  include: {
    user: {
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        roi: true 
      }
    },
    investment: {
      select: { 
        title: true, 
        category: true 
      }
    }
  },
  // ADD THIS SELECT STATEMENT
  select: {
    id: true,
    userId: true,
    status: true,
    roiAmount: true,       // Fetch this
    totalRoiAdded: true,   // Also fetch this to avoid data mismatch
    user: { // Keep the include for user as is
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roi: true
      }
    },
    investment: { // Keep the include for investment as is
      select: {
        title: true,
        category: true
      }
    }
  }
});

    if (!investment) {
      console.error('[ROI Update] Investment not found:', investmentId);
      return res.status(404).json({ error: 'Investment not found' });
    }

    console.log(`[ROI Update] Found investment for user ${investment.userId}`);
    console.log(`[ROI Update] Current investment ROI: ${investment.roiAmount || 0}`);
    console.log(`[ROI Update] Current user total ROI: ${investment.user.roi || 0}`);

    // Only allow ROI updates for ACTIVE investments
    if (investment.status !== 'ACTIVE') {
      console.error('[ROI Update] Investment not active:', investment.status);
      return res.status(400).json({ 
        error: 'ROI can only be updated for active investments',
        currentStatus: investment.status 
      });
    }

    const newRoiAmount = parseFloat(roiAmount);
    const previousRoiAmount = investment.roiAmount || 0;
    const roiDifference = newRoiAmount - previousRoiAmount;
    const previousUserRoi = investment.user.roi || 0;
    const newUserRoi = previousUserRoi + roiDifference;

    console.log(`[ROI Update] ROI difference: ${roiDifference}`);
    console.log(`[ROI Update] User ROI will change: ${previousUserRoi} -> ${newUserRoi}`);

    // Simple update - just update the two fields
    const updatedInvestment = await prisma.userInvestment.update({
  where: { id: investmentId },
  data: { 
    roiAmount: newRoiAmount,
    // Also increment the totalRoiAdded by the difference
    totalRoiAdded: {
      increment: roiDifference
    }
  }
});

    console.log(`[ROI Update] Updated investment ROI to ${updatedInvestment.roiAmount}`);

    // Update user's total ROI
    const updatedUser = await prisma.user.update({
      where: { id: investment.userId },
      data: {
        roi: newUserRoi
      },
      select: { 
        id: true, 
        roi: true, 
        email: true, 
        firstName: true, 
        lastName: true 
      }
    });

    console.log(`[ROI Update] Updated user total ROI to ${updatedUser.roi}`);

    // Try to create notification (optional, won't fail if it errors)
    try {
      await prisma.notification.create({
        data: {
          userId: investment.userId,
          title: 'Investment ROI Updated',
          message: `Your ${investment.investment.title} investment now has ${newRoiAmount.toFixed(2)} in available ROI.`,
          type: 'ACCOUNT'
        }
      });
      console.log(`[ROI Update] Notification created successfully`);
    } catch (notifError) {
      console.warn('[ROI Update] Could not create notification:', notifError.message);
    }

    console.log(`[ROI Update] Update completed successfully`);

    res.json({
      success: true,
      message: `Successfully set ROI to ${newRoiAmount.toFixed(2)}`,
      investment: {
        id: updatedInvestment.id,
        roiAmount: updatedInvestment.roiAmount,
        userId: updatedInvestment.userId
      },
      updatedTotalROI: updatedUser.roi,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName
      }
    });

  } catch (error) {
    console.error('[ROI Update] FULL ERROR:', error);
    console.error('[ROI Update] Error message:', error.message);
    console.error('[ROI Update] Error code:', error.code);
    console.error('[ROI Update] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to update investment ROI',
      details: error.message,
      code: error.code
    });
  }
});

router.get('/user-investments/:investmentId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { investmentId } = req.params;

    const investment = await prisma.userInvestment.findUnique({
      where: { id: investmentId },
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
            category: true,
            returnRate: true,
            duration: true
          }
        },
        roiTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json(investment);
  } catch (error) {
    console.error('Get investment details error:', error);
    res.status(500).json({ error: 'Failed to fetch investment details' });
  }
});

// Debug route to test if routes are working
router.get('/debug/:userId/investments', authenticateToken, isAdmin, (req, res) => {
  const { userId } = req.params;
  console.log(`[DEBUG] Route /api/admin/users/${userId}/investments was called`);
  console.log(`[DEBUG] User ID from params: ${userId}`);
  console.log(`[DEBUG] Admin ID: ${req.user?.id}`);
  
  res.json({
    success: true,
    message: 'Debug route working',
    userId,
    adminId: req.user?.id,
    timestamp: new Date().toISOString()
  });
});


export default router;
