import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

function calculateEndDate(duration) {
  const now = new Date();
  const match = duration.match(/(\d+)\s*(month|year)/i);
  
  if (!match) return new Date(now.setMonth(now.getMonth() + 6)); // Default 6 months
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  if (unit === 'month') {
    return new Date(now.setMonth(now.getMonth() + value));
  } else if (unit === 'year') {
    return new Date(now.setFullYear(now.getFullYear() + value));
  }
  
  return new Date(now.setMonth(now.getMonth() + 6));
}

// Helper function to calculate return amount
function calculateReturnAmount(amount, returnRate) {
  const rate = parseFloat(returnRate.replace('%', '')) / 100;
  return amount * (1 + rate);
}

// POST - Create investment application (authenticated users)
router.post('/', async (req, res) => {
  try {
    const {
      investmentId,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      amount,
      message
    } = req.body;

    // Validate required fields
    if (!investmentId || !firstName || !lastName || !email || !phoneNumber || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get investment details
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    if (investment.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'This investment is not currently available' });
    }

    // Validate minimum amount
    const investmentAmount = parseFloat(amount);
    if (investmentAmount < investment.minAmount) {
      return res.status(400).json({ 
        error: `Minimum investment amount is $${investment.minAmount.toLocaleString()}` 
      });
    }

    // Get userId from session if authenticated
    const userId = req.session?.userId || null;

    // Create application
    const application = await prisma.investmentApplication.create({
      data: {
        investmentId,
        userId,
        firstName,
        lastName,
        email,
        phoneNumber,
        amount: investmentAmount,
        message: message || '',
        status: 'PENDING'
      },
      include: {
        investment: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Create notification for user if authenticated
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          title: 'Investment Application Submitted',
          message: `Your application for ${investment.title} has been submitted successfully. Amount: $${investmentAmount.toLocaleString()}`,
          type: 'APPLICATION',
          read: false
        }
      });
    }

    // TODO: Send email notification to admins about new application

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error creating investment application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// GET all applications (admin only)
router.get('/admin/all', async (req, res) => {
  try {
    const { status, investmentId } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (investmentId) where.investmentId = investmentId;

    const applications = await prisma.investmentApplication.findMany({
      where,
      include: {
        investment: {
          select: {
            id: true,
            title: true,
            returnRate: true,
            duration: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            accountNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET user's own applications (authenticated users)
router.get('/my-applications', async (req, res) => {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const applications = await prisma.investmentApplication.findMany({
      where: { userId },
      include: {
        investment: {
          select: {
            id: true,
            title: true,
            returnRate: true,
            duration: true,
            imageUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET single application (admin or owner)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId;

    const application = await prisma.investmentApplication.findUnique({
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
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check authorization (user can only view their own, admins can view all)
    if (application.userId !== userId && req.session?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// PUT - Update application status (admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await prisma.investmentApplication.findUnique({
      where: { id },
      include: {
        investment: true,
        user: true
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update application status
    const updatedApplication = await prisma.investmentApplication.update({
      where: { id },
      data: { 
        status,
        message: adminNote || application.message
      }
    });

    // If approved, create UserInvestment
    if (status === 'APPROVED' && application.userId) {
      const endDate = calculateEndDate(application.investment.duration);
      const returnAmount = calculateReturnAmount(
        application.amount, 
        application.investment.returnRate
      );

      await prisma.userInvestment.create({
        data: {
          userId: application.userId,
          investmentId: application.investmentId,
          amount: application.amount,
          returnAmount,
          startDate: new Date(),
          endDate,
          status: 'ACTIVE'
        }
      });

      // Update investment current amount
      await prisma.investment.update({
        where: { id: application.investmentId },
        data: {
          currentAmount: {
            increment: application.amount
          }
        }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: application.userId,
          title: 'Investment Application Approved',
          message: `Your investment of $${application.amount.toLocaleString()} in ${application.investment.title} has been approved! Expected return: $${returnAmount.toLocaleString()} by ${endDate.toLocaleDateString()}`,
          type: 'APPROVAL',
          read: false
        }
      });

      // TODO: Send approval email
    } else if (status === 'REJECTED' && application.userId) {
      // Create rejection notification
      await prisma.notification.create({
        data: {
          userId: application.userId,
          title: 'Investment Application Status',
          message: `Your investment application for ${application.investment.title} has been reviewed. ${adminNote || 'Please contact support for more information.'}`,
          type: 'REJECTION',
          read: false
        }
      });

      // TODO: Send rejection email
    }

    res.json({
      message: `Application ${status.toLowerCase()} successfully`,
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// DELETE application (admin only, only if status is PENDING)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.investmentApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== 'PENDING') {
      return res.status(400).json({ 
        error: 'Can only delete pending applications' 
      });
    }

    await prisma.investmentApplication.delete({
      where: { id }
    });

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

export default router;