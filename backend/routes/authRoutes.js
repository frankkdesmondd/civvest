import express from "express"
import { 
  forgotPassword, 
  resetPassword, 
  SignUp, 
  SignIn, 
  SignOut,
  getMe,
  GetStats
} from "../controllers/authController.js"
import { authenticateToken } from "../middleware/authMiddleware.js" // Add this import

const router = express.Router()

// Public routes
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.post('/signup', SignUp)
router.post('/signin', SignIn)
router.post('/signout', SignOut)

// Protected route - requires authentication
router.get('/me', authenticateToken, getMe) // Add authenticateToken middleware
router.get('/stats', authenticateToken, GetStats)

export default router

