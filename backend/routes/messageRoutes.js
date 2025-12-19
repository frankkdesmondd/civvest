import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Send message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { applicationId, content } = req.body;
    const senderId = req.user.userId;
    
    const sender = await prisma.user.findUnique({
      where: { id: senderId }
    });

    const message = await prisma.message.create({
      data: {
        applicationId,
        senderId,
        senderRole: sender.role,
        content
      }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for application
router.get('/:applicationId', authenticateToken, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { applicationId: req.params.applicationId },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;