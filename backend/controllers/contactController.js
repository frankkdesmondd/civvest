import { sendContactFormEmail } from '../services/emailService.js';

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message, accreditedInvestor } = req.body;
    
    console.log('📧 Received contact form submission:');
    console.log('   Name:', name);
    console.log('   Email:', email);
    console.log('   Phone:', phone);
    console.log('   Accredited Investor:', accreditedInvestor);
    console.log('   Message:', message?.substring(0, 100) + '...');
    console.log('   IP Address:', req.ip);
    console.log('   User Agent:', req.headers['user-agent']?.substring(0, 100));
    
    // Pass the req object to the email service
    await sendContactFormEmail({
      name,
      email,
      phone,
      message: message || 'No message provided',
      accreditedInvestor
    }, req); // ← Pass req as second parameter
    
    res.json({
      success: true,
      message: 'Thank you for contacting Civvest! We will get back to you soon.',
      submittedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit contact form. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};