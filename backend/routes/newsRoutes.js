// routes/news.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import { newsStorage } from '../config/cloudinary.js';

const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({ 
  storage: newsStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Get all published news
router.get('/', async (req, res) => {
  try {
    const news = await prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get single news post by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await prisma.newsPost.findUnique({
      where: { slug: req.params.slug }
    });
    
    if (!post || !post.published) {
      return res.status(404).json({ error: 'News post not found' });
    }

    // Get related posts
    const relatedPosts = await prisma.newsPost.findMany({
      where: {
        category: post.category,
        id: { not: post.id },
        published: true
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ post, relatedPosts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news post' });
  }
});

// Create news post (Admin only)
router.post('/', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, slug, content, excerpt, category, author, published } = req.body;
    
    // Cloudinary provides the full URL in req.file.path
    const imageUrl = req.file ? req.file.path : ''; 

    const post = await prisma.newsPost.create({
      data: { title, slug, content, excerpt, imageUrl, category, author, published: published === 'true' }
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create news post' });
  }
});

// Update news post (Admin only)
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.imageUrl = `/uploads/news/${req.file.filename}`;
    }

    if (updateData.published) {
      updateData.published = updateData.published === 'true';
    }

    const post = await prisma.newsPost.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update news post' });
  }
});

// Delete news post (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await prisma.newsPost.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'News post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news post' });
  }
});

// Get all posts for admin (including unpublished)
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const posts = await prisma.newsPost.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

export default router;
