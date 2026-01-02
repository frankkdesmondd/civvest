import prisma from "../config/prisma.js"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sendPasswordResetEmail } from "../services/emailService.js"
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

// SIGN UP
export const SignUp = async (req, res) => {
  try {
    const { email, password, firstName, lastName, referralCode } = req.body;

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
        referralBonus: true,
        profilePicture: true,
        referralCode: true,
        country: true,
        state: true,
        address: true,
        phone: true,
        bankName: true,
        accountName: true,
        bankAccountNumber: true,
        routingCode: true,
        createdAt: true
      }
    });

    // If referred, add bonus to referrer
    if (referrer) {
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          referralBonus: { increment: 50 },
          referralCount: { increment: 1 }
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

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Send response
    res.status(201).json({ 
      user, 
      token,
      success: true,
      message: 'Registration successful!'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

// SIGN IN - FIXED
export const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Sign-in attempt for:', email);

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user - ✅ INCLUDES profilePicture
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        accountNumber: true,
        balance: true,
        roi: true,
        referralBonus: true,
        profilePicture: true, // ✅ ADDED
        referralCode: true,
        referralCount: true,
        country: true,
        state: true,
        address: true,
        phone: true,
        bankName: true,
        accountName: true,
        bankAccountNumber: true,
        routingCode: true,
        createdAt: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password verified for:', email);

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ JWT token generated');

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    console.log('✅ Cookie set successfully');

    // Prepare user response - ✅ INCLUDES profilePicture
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      accountNumber: user.accountNumber,
      balance: user.balance,
      roi: user.roi,
      referralBonus: user.referralBonus,
      profilePicture: user.profilePicture, // ✅ ADDED
      referralCode: user.referralCode,
      country: user.country,
      state: user.state,
      address: user.address,
      phone: user.phone,
      bankName: user.bankName,
      accountName: user.accountName,
      bankAccountNumber: user.bankAccountNumber,
      routingCode: user.routingCode,
      createdAt: user.createdAt
    };

    console.log('✅ Signin successful for:', email);
    console.log('📸 Profile picture in response:', user.profilePicture ? 'Yes' : 'No');

    // Send response
    res.json({
      success: true,
      message: 'Sign in successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('❌ Signin error:', error);
    res.status(500).json({ 
      error: 'Failed to sign in',
      message: 'An unexpected error occurred. Please try again.'
    });
  }
};

// GET USER
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
        profilePicture: true, // Already has this ✅
        roi: true, 
        referralBonus: true,
        referrals: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('GetUser error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// SIGN OUT
export const SignOut = async (req, res) => {
  try {
    console.log('👋 Sign-out request received');

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    console.log('✅ Sign-out successful');
    
    res.json({ 
      success: true,
      message: 'Signed out successfully' 
    });

  } catch (error) {
    console.error('❌ Sign-out error:', error);
    res.status(500).json({ 
      error: 'Failed to sign out',
      message: 'An error occurred during sign out'
    });
  }
};

// GET ME - Already includes profilePicture ✅
export const getMe = async (req, res) => {
  try {
    console.log('👤 GetMe called');
    
    console.log('🔍 Auth details:', {
      hasUser: !!req.user,
      userId: req.user?.userId,
      email: req.user?.email
    });
    
    if (!req.user || !req.user.userId) {
      console.log('❌ No authenticated user in request');
      return res.status(401).json({ 
        success: false,
        error: 'Not authenticated',
        message: 'Please sign in to continue'
      });
    }
    
    const userId = req.user.userId;
    
    console.log('🔍 Fetching user data for user ID:', userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true, // Already has this ✅
        accountNumber: true,
        balance: true,
        roi: true,
        referralBonus: true,
        referralCode: true,
        createdAt: true,
        country: true,
        state: true,
        address: true,
        phone: true,
        bankName: true,
        accountName: true,
        bankAccountNumber: true,
        routingCode: true
      }
    });

    if (!user) {
      console.log('❌ User not found in database for ID:', userId);
      return res.status(404).json({ 
        success: false,
        error: 'User not found',
        message: 'Your account could not be found'
      });
    }

    console.log('✅ User data fetched successfully:', user.email);
    console.log('📸 Profile picture:', user.profilePicture ? 'Yes' : 'No');

    res.json({ 
      success: true,
      user 
    });

  } catch (error) {
    console.error('❌ Get me error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        message: 'Your session is invalid. Please sign in again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired',
        message: 'Your session has expired. Please sign in again.'
      });
    }
    
    console.error('Database/Server error in getMe:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user data',
      message: 'An unexpected error occurred'
    });
  }
};

export const GetStats = async(req, res) =>{
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authenticated'
      });
    }
    
    const userId = req.user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        referralBonus: true,
        referralCode: true,
        referralCount: true,
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const recentReferrals = await prisma.user.findMany({
      where: {
        referredBy: user.referralCode
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      totalReferrals: user.referralCount || 0,  // ✅ Fixed
      totalBonus: user.referralBonus || 0,
      recentReferrals,
      referralCode: user.referralCode,
      canWithdraw: user.referralCount >= 10 && user.referralBonus > 0,  // ✅ Fixed
      referralsNeeded: Math.max(0, 10 - (user.referralCount || 0))  // ✅ Fixed
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch referral stats' 
    });
  }
};
