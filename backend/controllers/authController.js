import prisma from "../config/prisma.js"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sendPasswordResetEmail } from "../services/emailService.js"
import { verifyRecaptcha } from "../utils/recaptcha.js"
import { sendWelcomeEmail } from '../services/emailService.js';

// Generate unique 7-digit account number
const generateAccountNumber = async () => {
  let accountNumber;
  let isUnique = false;
  
  while (!isUnique) {
    accountNumber = String(Math.floor(1000000 + Math.random() * 9000000));
    const existing = await prisma.user.findUnique({
      where: { accountNumber }
    });
    if (!existing) isUnique = true;
  }
  
  return accountNumber;
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(`🔄 Processing password reset request for: ${email}`);

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        
        // Security: Always return same message whether user exists or not
        if (!user) {
            console.log(`   ⚠️ Email not found in database: ${email}`);
            return res.json({ 
                message: 'If your email is registered, you will receive a password reset link shortly.',
                success: true 
            });
        }

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExp = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        console.log(`   ✅ User found, generating reset token`);
        console.log(`   Token: ${resetToken.substring(0, 20)}...`);
        console.log(`   Expires: ${resetTokenExp.toLocaleTimeString()}`);

        // Save token to database
        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExp,
            },
        });

        // Create reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        console.log(`   🔗 Generated reset link: ${resetLink}`);

        // Send email
        await sendPasswordResetEmail(email, resetLink);

        // Return success response
        res.json({ 
            message: 'Password reset link has been sent to your email!',
            success: true,
            note: 'Please check your inbox (and spam folder) for the reset link.'
        });

    } catch (error) {
        console.error('🔥 Forgot password error:', error);
        
        // More specific error messages
        let errorMessage = 'Failed to process password reset request';
        if (error.message.includes('Email sending failed')) {
            errorMessage = 'Could not send email. Please try again or contact support.';
        } else if (error.message.includes('database')) {
            errorMessage = 'Database error. Please try again.';
        }

        res.status(500).json({ 
            error: errorMessage,
            success: false,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        console.log(`🔄 Processing password reset with token`);

        // Validate password
        if (!password || password.length < 8) {
            return res.status(400).json({ 
                error: 'Password must be at least 8 characters long',
                success: false 
            });
        }

        // Find user with valid, non-expired token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExp: {
                    gt: new Date(), // Token not expired
                },
            },
        });

        if (!user) {
            console.log(`   ❌ Invalid or expired token`);
            return res.status(400).json({ 
                error: 'Invalid or expired reset token. Please request a new password reset.',
                success: false 
            });
        }

        console.log(`   ✅ Valid token found for user: ${user.email}`);

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExp: null,
                updatedAt: new Date(),
            },
        });

        console.log(`   ✅ Password updated successfully for: ${user.email}`);

        // Create notification for the user (optional)
        try {
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    title: 'Password Changed',
                    message: 'Your password has been successfully reset.',
                    type: 'SECURITY',
                },
            });
        } catch (notifError) {
            console.log('   Note: Could not create notification (non-critical)');
        }

        res.json({ 
            message: 'Password has been reset successfully! You can now login with your new password.',
            success: true 
        });

    } catch (error) {
        console.error('🔥 Reset password error:', error);
        res.status(500).json({ 
            error: 'Failed to reset password. Please try again.',
            success: false 
        });
    }
};

// In authController.js - Update SignUp function
export const SignUp = async (req, res) => {
  try {
    const { email, password, firstName, lastName, captchaToken, referralCode } = req.body;

    // Verify reCAPTCHA
    const isValidCaptcha = await verifyRecaptcha(captchaToken);
    if (!isValidCaptcha) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const accountNumber = await generateAccountNumber();

    // Generate unique referral code for new user
    const newUserReferralCode = `REF${accountNumber}`;

    // Check if referral code is valid
    let referrer = null;
    if (referralCode) {
      referrer = await prisma.user.findFirst({
        where: { referralCode: referralCode }
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'USER',
        accountNumber,
        balance: 0,
        roi: 0,
        referralBonus: referrer ? 50 : 0, // $50 if referred
        referralCode: newUserReferralCode,
        referredBy: referralCode || null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        accountNumber: true,
        balance: true,
        roi: true,
        referralBonus: true
      }
    });

    // If referred, add bonus to referrer
    if (referrer) {
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          referralBonus: {
            increment: 50
          }
        }
      });

      // Notify referrer
      await prisma.notification.create({
        data: {
          userId: referrer.id,
          title: 'Referral Bonus Earned!',
          message: `${firstName} ${lastName} signed up using your referral code. You've earned $50!`,
          type: 'REFERRAL'
        }
      });
    }

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to Civvest!',
        message: `Your account has been created successfully. Your account number is ${accountNumber}.${referrer ? ' You received a $50 referral bonus!' : ''}`,
        type: 'ACCOUNT'
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ user, token });
    
    await sendWelcomeEmail(user.email, user.name);
    
    res.json({ success: true, message: 'Registration successful!' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
}

export const SignIn = async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    // Verify reCAPTCHA using utility function
    const isValidCaptcha = await verifyRecaptcha(captchaToken);
    if (!isValidCaptcha) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // false for localhost
      sameSite: 'lax', // Use 'lax' for local development
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      // DO NOT set domain property for localhost/127.0.0.1
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountNumber: user.accountNumber,
        balance: user.balance
      },
      token
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
}

export const GetUser = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        accountNumber: true,
        balance: true,
        profilePicture: true,
        roi: true, 
        referralBonus: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export const SignOut = async (req, res) => {
  // Clear the cookie with the same options used when setting it
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  
  res.json({ message: 'Signed out successfully' });
}

// In authController.js
export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        accountNumber: true,
        balance: true,
        roi: true,              // Make sure this is included
        referralBonus: true,    // Make sure this is included
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

