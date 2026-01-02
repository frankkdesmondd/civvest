// routes/userRoutes.js or similar
router.get('/referral-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralBonus: true,
        referralCount: true,
        referralCode: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent referrals
    const recentReferrals = await prisma.user.findMany({
      where: {
        referredBy: user.referralCode
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      totalReferrals: user.referralCount || 0,
      totalBonus: user.referralBonus || 0,
      recentReferrals,
      referralCode: user.referralCode,
      canWithdraw: user.referralCount >= 10 && user.referralBonus > 0,
      referralsNeeded: Math.max(0, 10 - (user.referralCount || 0))
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({ error: 'Failed to fetch referral stats' });
  }
});
