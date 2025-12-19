import express from "express"
import { 
  forgotPassword, 
  resetPassword, 
  SignUp, 
  SignIn, 
  GetUser, 
  SignOut,
  getMe 
} from "../controllers/authController.js"

const router = express.Router()

router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.post('/signup', SignUp)
router.post('/signin', SignIn)
router.get('/me', GetUser)
router.post('/signout', SignOut)

export default router