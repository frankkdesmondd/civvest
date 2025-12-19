// routes/applications.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Submit investment application
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, amount, message, investmentId, userId } = req.body;

    // Get investment details
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    // Create application
    const application = await prisma.investmentApplication.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        amount: parseFloat(amount),
        message,
        investmentId,
        userId: userId || null
      }
    });

    // Send email notification to admin
    const emailContent = `
      <h2>New Investment Application Received</h2>
      <p><strong>Investment:</strong> ${investment.title}</p>
      <hr>
      <p><strong>Applicant Details:</strong></p>
      <ul>
        <li><strong>Name:</strong> ${firstName} ${lastName}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phoneNumber}</li>
        <li><strong>Commitment Amount:</strong> $${amount.toLocaleString()}</li>
        ${message ? `<li><strong>Message:</strong> ${message}</li>` : ''}
      </ul>
      <p><strong>Application ID:</strong> ${application.id}</p>
      <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'admin@civvest.com',
      subject: `New Investment Application - ${investment.title}`,
      html: emailContent
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get all applications (Admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const applications = await prisma.investmentApplication.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get user's applications
router.get('/my-applications', authenticateToken, async (req, res) => {
  try {
    const applications = await prisma.investmentApplication.findMany({
      where: { userId: req.user.userId },
      include: {
        investment: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update application status (Admin only)
router.patch('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await prisma.investmentApplication.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

export default router;