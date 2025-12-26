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

/// Create news post (Admin only)
router.post('/', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, slug, content, excerpt, category, author, published } = req.body;
    
    // Debug logging
    console.log('Create - File received:', req.file);
    console.log('Create - Body received:', req.body);
    
    // Cloudinary provides the full URL in req.file.path
    const imageUrl = req.file ? req.file.path : '';
    console.log('Create - imageUrl:', imageUrl);

    const post = await prisma.newsPost.create({
      data: { 
        title, 
        slug, 
        content, 
        excerpt, 
        imageUrl, 
        category, 
        author, 
        published: published === 'true' 
      }
    });
    
    console.log('Create - Post created:', post);
    res.status(201).json(post);
  } catch (error) {
    console.error('Create error details:', error);
    res.status(500).json({ 
      error: 'Failed to create news post: ' + error.message,
      details: error.stack 
    });
  }
});

// Update news post (Admin only)
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, slug, content, excerpt, category, author, published } = req.body;
    
    // Build update data
    const updateData = {
      title,
      slug,
      content,
      excerpt,
      category,
      author,
      published: published === 'true'
    };
    
    // Debug logging (remove after fixing)
    console.log('Update - File received:', req.file);
    console.log('Update - Body received:', req.body);
    
    // Use Cloudinary URL if file was uploaded
    if (req.file && req.file.path) {
      updateData.imageUrl = req.file.path;
      console.log('Update - Setting imageUrl to:', updateData.imageUrl);
    } else if (req.body.imageUrl) {
      // Keep existing image if no new file uploaded
      updateData.imageUrl = req.body.imageUrl;
    } else {
      updateData.imageUrl = '';
    }

    const post = await prisma.newsPost.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(post);
  } catch (error) {
    console.error('Update error details:', error);
    res.status(500).json({ error: 'Failed to update news post: ' + error.message });
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
