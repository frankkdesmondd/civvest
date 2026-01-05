import nodemailer from 'nodemailer';

// Configure transporter with Zoho SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
});

// ============================================
// WELCOME EMAIL - For New User Registration
// ============================================
export const sendWelcomeEmail = async (email, userName) => {
    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                .header { background: #041a35; padding: 40px 20px; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 28px; }
                .welcome-banner { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; color: white; }
                .welcome-banner h2 { margin: 0 0 10px 0; font-size: 24px; }
                .content { padding: 40px 30px; }
                .button { 
                    display: inline-block; 
                    background: #2563eb; 
                    color: white !important; 
                    padding: 14px 32px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    margin: 20px 0; 
                    font-size: 16px;
                }
                .feature-box { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0; 
                    border-left: 4px solid #2563eb; 
                }
                .feature-item { 
                    margin: 15px 0; 
                    padding-left: 30px; 
                    position: relative; 
                }
                .feature-item:before { 
                    content: "✓"; 
                    position: absolute; 
                    left: 0; 
                    color: #28a745; 
                    font-weight: bold; 
                    font-size: 20px;
                }
                .cta-section { 
                    background: #e7f3ff; 
                    padding: 25px; 
                    border-radius: 8px; 
                    text-align: center; 
                    margin: 30px 0; 
                }
                .footer { 
                    text-align: center; 
                    padding: 20px; 
                    color: #6c757d; 
                    font-size: 12px; 
                    border-top: 1px solid #e9ecef; 
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                  <img src="https://www.civvest.com/civvest company logo.png" alt="Civvest Logo" style="max-width: 180px; height: auto; margin-bottom: 10px;" />
                  <h1 style="margin-top: 10px;">Civvest</h1>
                </div>
                <div class="welcome-banner">
                    <h2>🎉 Welcome to Civvest!</h2>
                    <p style="margin: 0; font-size: 16px;">Your journey to smart energy investments starts here</p>
                </div>
                <div class="content">
                    <h2 style="color: #041a35; margin-top: 0;">Hello ${userName}!</h2>
                    <p>We're thrilled to have you join the Civvest community. You've taken the first step towards intelligent energy investments and portfolio diversification.</p>
                    
                    <div class="feature-box">
                        <h3 style="margin-top: 0; color: #041a35;">What You Can Do Now:</h3>
                        <div class="feature-item">
                            <strong>Explore Investment Opportunities:</strong> Browse our curated energy projects
                        </div>
                        <div class="feature-item">
                            <strong>Complete Your Profile:</strong> Add your investor preferences and accreditation details
                        </div>
                        <div class="feature-item">
                            <strong>Learn & Discover:</strong> Access educational resources about energy investments
                        </div>
                        <div class="feature-item">
                            <strong>Connect with Our Team:</strong> Schedule a consultation with our investment advisors
                        </div>
                    </div>
                    
                    <div class="cta-section">
                        <h3 style="margin-top: 0; color: #041a35;">Ready to Get Started?</h3>
                        <a href="${process.env.FRONTEND_URL || 'https://www.civvest.com'}/dashboard" class="button">Go to Your Dashboard</a>
                        <p style="margin-bottom: 0; font-size: 14px; color: #666;">Explore investment opportunities tailored for you</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Complete your investor profile to unlock exclusive investment opportunities and personalized recommendations.</p>
                    </div>
                    
                    <p style="margin-top: 30px;">If you have any questions, our team is here to help. Simply reply to this email or reach out to us at <a href="mailto:admin@civvest.com">admin@civvest.com</a></p>
                    
                    <p>Welcome aboard!<br><strong>The Civvest Team</strong></p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Civvest. All rights reserved.</p>
                    <p>This email was sent to ${email}</p>
                    <p style="margin-top: 10px;">
                        <a href="${process.env.FRONTEND_URL || 'https://www.civvest.com'}/terms" style="color: #6c757d; margin: 0 10px;">Terms</a> | 
                        <a href="${process.env.FRONTEND_URL || 'https://www.civvest.com'}/privacy" style="color: #6c757d; margin: 0 10px;">Privacy</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    const textTemplate = `
        WELCOME TO CIVVEST!
        
        Hello ${userName}!
        
        We're thrilled to have you join the Civvest community. You've taken the first step towards intelligent energy investments and portfolio diversification.
        
        WHAT YOU CAN DO NOW:
        
        ✓ Explore Investment Opportunities - Browse our curated energy projects
        ✓ Complete Your Profile - Add your investor preferences and accreditation details
        ✓ Learn & Discover - Access educational resources about energy investments
        ✓ Connect with Our Team - Schedule a consultation with our investment advisors
        
        Get Started: ${process.env.FRONTEND_URL || 'https://www.civvest.com'}/dashboard
        
        Pro Tip: Complete your investor profile to unlock exclusive investment opportunities and personalized recommendations.
        
        Questions? Contact us at admin@civvest.com
        
        Welcome aboard!
        The Civvest Team
        
        © ${new Date().getFullYear()} Civvest
    `;

    try {
        console.log(`📧 Sending welcome email to: ${email}`);
        
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Civvest'}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: '🎉 Welcome to Civvest - Your Investment Journey Starts Now!',
            text: textTemplate,
            html: htmlTemplate,
        });

        console.log(`✅ Welcome email sent successfully to ${email}`);
        console.log(`   Message ID: ${info.messageId}`);
        
        return info;
    } catch (error) {
        console.error('❌ FAILED to send welcome email:', error.message);
        throw new Error(`Welcome email failed: ${error.message}`);
    }
};

// ============================================
// TRANSACTION EMAIL - For Investment Actions
// ============================================
export const sendTransactionEmail = async (email, transactionData) => {
    const {
        userName,
        transactionType, // 'investment', 'withdrawal', 'dividend', 'refund'
        amount,
        projectName,
        transactionId,
        transactionDate,
        status, // 'pending', 'completed', 'processing', 'failed'
        additionalDetails = {}
    } = transactionData;

    // Customize content based on transaction type
    const transactionConfig = {
        investment: {
            emoji: '💰',
            title: 'Investment Confirmed',
            description: `Your investment in <strong>${projectName}</strong> has been successfully processed.`,
            actionText: 'View Investment Details',
            color: '#28a745'
        },
        withdrawal: {
            emoji: '💸',
            title: 'Withdrawal Processed',
            description: `Your withdrawal request has been processed successfully.`,
            actionText: 'View Transaction',
            color: '#2563eb'
        },
        dividend: {
            emoji: '📈',
            title: 'Dividend Payment Received',
            description: `You've received a dividend payment from <strong>${projectName}</strong>.`,
            actionText: 'View Payment Details',
            color: '#17a2b8'
        },
        refund: {
            emoji: '🔄',
            title: 'Refund Processed',
            description: `Your refund has been processed successfully.`,
            actionText: 'View Details',
            color: '#ffc107'
        }
    };

    const config = transactionConfig[transactionType] || transactionConfig.investment;

    const statusBadge = {
        pending: '<span style="background: #ffc107; color: #000; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">⏳ PENDING</span>',
        completed: '<span style="background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">✓ COMPLETED</span>',
        processing: '<span style="background: #2563eb; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">⟳ PROCESSING</span>',
        failed: '<span style="background: #dc3545; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">✕ FAILED</span>'
    };

    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                .header { background: #041a35; padding: 30px 20px; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 24px; }
                .transaction-header { 
                    background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); 
                    padding: 30px; 
                    text-align: center; 
                    color: white; 
                }
                .transaction-header h2 { margin: 0 0 10px 0; font-size: 26px; }
                .content { padding: 40px 30px; }
                .amount-box { 
                    background: #f8f9fa; 
                    padding: 25px; 
                    border-radius: 12px; 
                    text-align: center; 
                    margin: 25px 0; 
                    border: 2px solid ${config.color}; 
                }
                .amount { 
                    font-size: 36px; 
                    font-weight: bold; 
                    color: ${config.color}; 
                    margin: 10px 0; 
                }
                .info-grid { 
                    background: #f8f9fa; 
                    padding: 25px; 
                    border-radius: 8px; 
                    margin: 25px 0; 
                }
                .info-row { 
                    display: flex; 
                    justify-content: space-between; 
                    padding: 12px 0; 
                    border-bottom: 1px solid #e9ecef; 
                }
                .info-row:last-child { border-bottom: none; }
                .info-label { font-weight: bold; color: #6c757d; }
                .info-value { color: #041a35; font-weight: 500; }
                .button { 
                    display: inline-block; 
                    background: ${config.color}; 
                    color: white !important; 
                    padding: 14px 32px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    margin: 20px 0; 
                    font-size: 16px;
                }
                .alert-box { 
                    background: #e7f3ff; 
                    padding: 20px; 
                    border-radius: 8px; 
                    border-left: 4px solid #2563eb; 
                    margin: 25px 0; 
                }
                .footer { 
                    text-align: center; 
                    padding: 20px; 
                    color: #6c757d; 
                    font-size: 12px; 
                    border-top: 1px solid #e9ecef; 
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Civvest</h1>
                </div>
                <div class="transaction-header">
                    <h2>${config.emoji} ${config.title}</h2>
                    <p style="margin: 0; font-size: 16px;">${statusBadge[status]}</p>
                </div>
                <div class="content">
                    <h2 style="color: #041a35; margin-top: 0;">Hello ${userName}!</h2>
                    <p>${config.description}</p>
                    
                    <div class="amount-box">
                        <p style="margin: 0; color: #6c757d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Transaction Amount</p>
                        <div class="amount">$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    
                    <div class="info-grid">
                        <h3 style="margin-top: 0; color: #041a35;">Transaction Details</h3>
                        <div class="info-row">
                            <span class="info-label">Transaction ID:</span>
                            <span class="info-value">#${transactionId}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Date & Time:</span>
                            <span class="info-value">${new Date(transactionDate).toLocaleString('en-US', { 
                                dateStyle: 'long', 
                                timeStyle: 'short' 
                            })}</span>
                        </div>
                        ${projectName ? `
                        <div class="info-row">
                            <span class="info-label">Project:</span>
                            <span class="info-value">${projectName}</span>
                        </div>
                        ` : ''}
                        <div class="info-row">
                            <span class="info-label">Status:</span>
                            <span class="info-value" style="color: ${config.color};">${status.toUpperCase()}</span>
                        </div>
                        ${additionalDetails.expectedReturn ? `
                        <div class="info-row">
                            <span class="info-label">Expected Return:</span>
                            <span class="info-value">${additionalDetails.expectedReturn}%</span>
                        </div>
                        ` : ''}
                        ${additionalDetails.investmentPeriod ? `
                        <div class="info-row">
                            <span class="info-label">Investment Period:</span>
                            <span class="info-value">${additionalDetails.investmentPeriod}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://www.civvest.com'}/dashboard/transactions/${transactionId}" class="button">
                            ${config.actionText}
                        </a>
                    </div>
                    
                    ${status === 'pending' ? `
                    <div class="alert-box">
                        <p style="margin: 0;"><strong>⏳ Processing Time:</strong> Your transaction is being processed and should be completed within 24-48 hours. You'll receive another email once it's finalized.</p>
                    </div>
                    ` : ''}
                    
                    ${transactionType === 'investment' ? `
                    <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
                        <h4 style="margin-top: 0; color: #041a35;">📊 What Happens Next?</h4>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>You'll receive regular updates on your investment performance</li>
                            <li>Dividend payments will be processed according to the project schedule</li>
                            <li>Track your investment in real-time through your dashboard</li>
                            <li>Download tax documents at year-end</li>
                        </ul>
                    </div>
                    ` : ''}
                    
                    <p style="margin-top: 30px;">Questions about this transaction? Our support team is here to help at <a href="mailto:admin@civvest.com">admin@civvest.com</a></p>
                    
                    <p style="margin-top: 20px; color: #6c757d; font-size: 13px;">
                        <strong>Security Note:</strong> This is a transaction confirmation from Civvest. If you didn't initiate this transaction, please contact us immediately.
                    </p>
                </div>
                <div class="footer">
                    <p><strong>Important:</strong> Keep this email for your records</p>
                    <p>© ${new Date().getFullYear()} Civvest. All rights reserved.</p>
                    <p>Transaction ID: #${transactionId} | ${email}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const textTemplate = `
        ${config.emoji} ${config.title.toUpperCase()}
        
        Hello ${userName}!
        
        ${config.description.replace(/<[^>]*>/g, '')}
        
        TRANSACTION AMOUNT: $${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        
        TRANSACTION DETAILS:
        -------------------
        Transaction ID: #${transactionId}
        Date & Time: ${new Date(transactionDate).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
        ${projectName ? `Project: ${projectName}` : ''}
        Status: ${status.toUpperCase()}
        ${additionalDetails.expectedReturn ? `Expected Return: ${additionalDetails.expectedReturn}%` : ''}
        ${additionalDetails.investmentPeriod ? `Investment Period: ${additionalDetails.investmentPeriod}` : ''}
        
        View Full Details: ${process.env.FRONTEND_URL || 'https://www.civvest.com'}/dashboard/transactions/${transactionId}
        
        ${status === 'pending' ? 'Processing Time: Your transaction is being processed and should be completed within 24-48 hours.' : ''}
        
        Questions? Contact us at admin@civvest.com
        
        Security Note: If you didn't initiate this transaction, please contact us immediately.
        
        © ${new Date().getFullYear()} Civvest
        Transaction ID: #${transactionId}
    `;

    try {
        console.log(`📧 Sending transaction email to: ${email}`);
        console.log(`   Type: ${transactionType} | Amount: $${amount} | Status: ${status}`);
        
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Civvest'}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: `${config.emoji} ${config.title} - $${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} | Civvest`,
            text: textTemplate,
            html: htmlTemplate,
        });

        console.log(`✅ Transaction email sent successfully to ${email}`);
        console.log(`   Message ID: ${info.messageId}`);
        
        return info;
    } catch (error) {
        console.error('❌ FAILED to send transaction email:', error.message);
        throw new Error(`Transaction email failed: ${error.message}`);
    }
};

// ============================================
// PASSWORD RESET EMAIL
// ============================================
export const sendPasswordResetEmail = async (email, resetLink) => {
    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                .header { background: #041a35; padding: 30px 20px; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 24px; }
                .content { padding: 40px 30px; }
                .button { 
                    display: inline-block; 
                    background: #2563eb; 
                    color: white !important; 
                    padding: 14px 28px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    margin: 20px 0; 
                    font-size: 16px;
                }
                .link-box { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    border-radius: 6px; 
                    border-left: 4px solid #2563eb; 
                    margin: 20px 0; 
                    word-break: break-all; 
                    font-family: monospace; 
                    font-size: 14px;
                }
                .footer { 
                    text-align: center; 
                    padding: 20px; 
                    color: #6c757d; 
                    font-size: 12px; 
                    border-top: 1px solid #e9ecef; 
                }
                .expiry-note { 
                    color: #dc3545; 
                    font-weight: bold; 
                    margin-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Civvest</h1>
                </div>
                <div class="content">
                    <h2 style="color: #041a35; margin-top: 0;">Password Reset Request</h2>
                    <p>You recently requested to reset your password for your Civvest account. Click the button below to proceed:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" class="button">Reset Your Password</a>
                    </div>
                    
                    <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                    <div class="link-box">${resetLink}</div>
                    
                    <p class="expiry-note">⚠️ This link will expire in 15 minutes for security reasons.</p>
                    
                    <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                    
                    <p>Need help? Contact our support team at <a href="mailto:admin@civvest.com">admin@civvest.com</a></p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Civvest. All rights reserved.</p>
                    <p>This email was sent to ${email}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const textTemplate = `
        PASSWORD RESET REQUEST - Civvest
        
        You requested to reset your password for your Civvest account.
        
        Reset Link: ${resetLink}
        
        This link will expire in 15 minutes.
        
        If you didn't request this password reset, please ignore this email.
        
        Need help? Contact: admin@civvest.com
        
        © ${new Date().getFullYear()} Civvest
    `;

    try {
        console.log(`📧 Attempting to send password reset email to: ${email}`);
        console.log(`🔗 Reset Link: ${resetLink}`);
        
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Civvest'}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Reset Your Civvest Password',
            text: textTemplate,
            html: htmlTemplate,
        });

        console.log(`✅ Password reset email sent successfully!`);
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   To: ${email}`);
        
        return info;
    } catch (error) {
        console.error('❌ FAILED to send password reset email:', error.message);
        console.error('   Error details:', error);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

// ============================================
// CONTACT FORM EMAIL
// ============================================
export const sendContactFormEmail = async (contactData, req = null) => {
  const { name, email, phone, message, accreditedInvestor } = contactData;
  
  const ipAddress = req?.ip || req?.socket?.remoteAddress || 'Not available';
  const userAgent = req?.headers?.['user-agent']?.substring(0, 100) || 'Not available';
  
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #041a35; padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 40px 30px; }
        .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #041a35; }
        .info-item { margin: 10px 0; }
        .label { font-weight: bold; color: #041a35; display: inline-block; width: 150px; }
        .accredited { color: #28a745; font-weight: bold; }
        .not-accredited { color: #dc3545; font-weight: bold; }
        .message-box { background: #e9ecef; padding: 15px; border-radius: 6px; margin: 15px 0; font-style: italic; }
        .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; border-top: 1px solid #e9ecef; }
        .tech-info { background: #e9ecef; padding: 10px; border-radius: 4px; font-size: 11px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🆕 New Contact Form Submission</h1>
        </div>
        <div class="content">
          <h2 style="color: #041a35; margin-top: 0;">Contact Details</h2>
          
          <div class="info-box">
            <div class="info-item">
              <span class="label">Name:</span>
              <span>${name}</span>
            </div>
            <div class="info-item">
              <span class="label">Email:</span>
              <span><a href="mailto:${email}">${email}</a></span>
            </div>
            <div class="info-item">
              <span class="label">Phone:</span>
              <span><a href="tel:${phone}">${phone}</a></span>
            </div>
            <div class="info-item">
              <span class="label">Accredited Investor:</span>
              <span class="${accreditedInvestor ? 'accredited' : 'not-accredited'}">
                ${accreditedInvestor ? '✅ YES' : '❌ NO'}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Submitted:</span>
              <span>${new Date().toLocaleString()}</span>
            </div>
          </div>
          
          <h3 style="color: #041a35;">Message:</h3>
          <div class="message-box">
            ${message || '<em>No message provided</em>'}
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
            <p style="margin: 0;">
              <strong>Action Required:</strong> Please follow up with ${name} within 24 hours.
              ${accreditedInvestor ? ' <span style="color: #28a745;">(PRIORITY: Accredited Investor)</span>' : ''}
            </p>
          </div>
          
          <div style="margin-top: 30px;">
            <a href="mailto:${email}" style="background: #041a35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              Reply to ${name.split(' ')[0]}
            </a>
            <a href="tel:${phone}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Call ${name.split(' ')[0]}
            </a>
          </div>
          
          <div class="tech-info">
            <p><strong>Technical Details:</strong></p>
            <p>IP Address: ${ipAddress}</p>
            <p>Browser: ${userAgent}</p>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Civvest Energy Partners. This email was generated from the website contact form.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textTemplate = `
    NEW CONTACT FORM SUBMISSION - Civvest Energy Partners
    
    Contact Details:
    ----------------
    Name: ${name}
    Email: ${email}
    Phone: ${phone}
    Accredited Investor: ${accreditedInvestor ? 'YES' : 'NO'}
    Submitted: ${new Date().toLocaleString()}
    IP Address: ${ipAddress}
    
    Message:
    --------
    ${message || 'No message provided'}
    
    Action Required: Please follow up with ${name} within 24 hours.
    ${accreditedInvestor ? 'PRIORITY: This person is an accredited investor.' : ''}
    
    Technical Details:
    -----------------
    Browser: ${userAgent}
    
    ---
    This email was generated from the Civvest website contact form.
  `;
  
  try {
    console.log('📤 Sending contact form email to admin@civvest.com');
    console.log('   From:', email);
    console.log('   IP:', ipAddress);
    
    const info = await transporter.sendMail({
      from: `"Civvest Contact Form" <${process.env.EMAIL_FROM}>`,
      to: 'admin@civvest.com',
      replyTo: email,
      subject: `📥 New Contact: ${name} - ${accreditedInvestor ? 'Accredited Investor' : 'General Inquiry'}`,
      text: textTemplate,
      html: htmlTemplate,
    });
    
    console.log('✅ Contact email sent successfully! Message ID:', info.messageId);
    
    await sendConfirmationEmail({ name, email });
    
    return info;
  } catch (error) {
    console.error('❌ Failed to send contact email:', error);
    throw error;
  }
};

// ============================================
// CONFIRMATION EMAIL (for contact form)
// ============================================
const sendConfirmationEmail = async ({ name, email }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #041a35; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Civvest Energy Partners</h1>
        </div>
        <div class="content">
          <h2>Thank You for Contacting Us, ${name}!</h2>
          <p>We have received your inquiry and a member of our team will review it shortly.</p>
          <p>We typically respond within 24-48 hours during business days.</p>
          <p>If your matter is urgent, please message us on whatsapp using <a href='https://wa.me/19292481175'>this link</a></p>
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Our investment team will review your information</li>
            <li>We'll contact you to discuss opportunities</li>
            <li>Schedule a consultation call if appropriate</li>
          </ul>
          <p>Best regards,<br>The Civvest Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Civvest Energy Partners. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Thank You for Contacting Civvest Energy Partners!
    
    Dear ${name},
    
    We have received your inquiry and a member of our team will review it shortly.
    
    We typically respond within 24-48 hours during business days.
    
    If your matter is urgent, please message us on whatsapp.
    
    Best regards,
    The Civvest Team
    
    © ${new Date().getFullYear()} Civvest Energy Partners.
    This is an automated message. Please do not reply to this email.
  `;
  
  try {
    await transporter.sendMail({
      from: `"Civvest Energy Partners" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Thank You for Contacting Civvest',
      text: text,
      html: html,
    });
    console.log('✅ Confirmation email sent to submitter:', email);
  } catch (error) {
    console.error('⚠️ Could not send confirmation email (non-critical):', error);
  }
};

// ============================================
// ROI WITHDRAWAL REQUEST EMAIL - ADD THIS TO YOUR emailService.js
// ============================================
// Place this function at the end of your emailService.js file, before the export statement

export const sendROIWithdrawalRequestEmail = async (email, withdrawalData) => {
    const {
        userName,
        amount,
        investmentTitle,
        withdrawalMethod, // 'BANK_TRANSFER' or 'CRYPTO_WALLET'
        transactionId,
        requestDate
    } = withdrawalData;

    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                .header { background: #041a35; padding: 40px 20px; text-align: center; }
                .header img { max-width: 180px; height: auto; margin-bottom: 10px; }
                .header h1 { color: white; margin: 10px 0 0 0; font-size: 28px; }
                .success-banner { 
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                    padding: 30px; 
                    text-align: center; 
                    color: white; 
                }
                .success-banner h2 { margin: 0 0 10px 0; font-size: 24px; }
                .content { padding: 40px 30px; }
                .amount-box { 
                    background: #f8f9fa; 
                    padding: 25px; 
                    border-radius: 12px; 
                    text-align: center; 
                    margin: 25px 0; 
                    border: 2px solid #28a745; 
                }
                .amount { 
                    font-size: 36px; 
                    font-weight: bold; 
                    color: #28a745; 
                    margin: 10px 0; 
                }
                .info-box { 
                    background: #e7f3ff; 
                    padding: 20px; 
                    border-radius: 8px; 
                    border-left: 4px solid #2563eb; 
                    margin: 25px 0; 
                }
                .info-row { 
                    display: flex; 
                    justify-content: space-between; 
                    padding: 10px 0; 
                    border-bottom: 1px solid #d1e7ff; 
                }
                .info-row:last-child { border-bottom: none; }
                .info-label { font-weight: bold; color: #041a35; }
                .info-value { color: #2563eb; font-weight: 500; }
                .timeline-box { 
                    background: #fff3cd; 
                    padding: 20px; 
                    border-radius: 8px; 
                    border-left: 4px solid #ffc107; 
                    margin: 25px 0; 
                }
                .contact-box { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 8px; 
                    text-align: center; 
                    margin: 25px 0; 
                }
                .contact-box a { 
                    color: #2563eb; 
                    text-decoration: none; 
                    font-weight: bold; 
                }
                .footer { 
                    text-align: center; 
                    padding: 20px; 
                    color: #6c757d; 
                    font-size: 12px; 
                    border-top: 1px solid #e9ecef; 
                }
                .logo-footer { 
                    color: #041a35; 
                    font-weight: bold; 
                    font-size: 16px; 
                    margin: 10px 0; 
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://www.civvest.com/civvest-main.jpg" alt="Civvest Logo" />
                    <h1>CIVVEST®</h1>
                </div>
                
                <div class="success-banner">
                    <h2>ROI Withdrawal Request Received</h2>
                    <p style="margin: 0; font-size: 16px;">Your request is being processed</p>
                </div>
                
                <div class="content">
                    <h2 style="color: #041a35; margin-top: 0;">Dear ${userName},</h2>
                    
                    <p style="font-size: 16px; line-height: 1.8;">
                        We are pleased to inform you that your request for <strong>Return on Investment (ROI) withdrawal</strong> has been <strong>successfully received and is being processed</strong>.
                    </p>
                    
                    <div class="amount-box">
                        <p style="margin: 0; color: #6c757d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Withdrawal Amount</p>
                        <div class="amount">$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">via ${withdrawalMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Crypto Wallet'}</p>
                    </div>
                    
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #041a35;">Withdrawal Details</h3>
                        <div class="info-row">
                            <span class="info-label">Investment:</span>
                            <span class="info-value">${investmentTitle || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Transaction ID:</span>
                            <span class="info-value">#${transactionId}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Request Date:</span>
                            <span class="info-value">${new Date(requestDate).toLocaleString('en-US', { 
                                dateStyle: 'long', 
                                timeStyle: 'short' 
                            })}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Method:</span>
                            <span class="info-value">${withdrawalMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cryptocurrency'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Status:</span>
                            <span class="info-value" style="color: #ffc107; font-weight: bold;">⏳ PENDING APPROVAL</span>
                        </div>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.8; margin-top: 30px;">
                        Thank you for your continued trust and investment in our oil and gas production ventures. 
                        We value your partnership and remain committed to delivering sustainable returns.
                    </p>
                    
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h4 style="margin-top: 0; color: #041a35;">📊 What Happens Next?</h4>
                        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                            <li>You'll receive an email once it's approved</li>
                            <li>Funds will be transferred to your registered ${withdrawalMethod === 'BANK_TRANSFER' ? 'bank account' : 'crypto wallet'}</li>
                            <li>You'll receive a final confirmation once the transfer is complete</li>
                        </ul>
                    </div>
                    
                    <div class="contact-box">
                        <h3 style="margin-top: 0; color: #041a35;">Need Assistance?</h3>
                        <p style="margin: 10px 0;">For any inquiries or assistance, please contact us:</p>
                        <p style="margin: 10px 0;">
                            📧 <a href="mailto:admin@civvest.com">admin@civvest.com</a>
                        </p>
                        <p style="margin: 10px 0;">
                            🌐 <a href="https://www.civvest.com">www.civvest.com</a>
                        </p>
                    </div>
                    
                    <p style="margin-top: 30px; font-size: 16px;">
                        <strong>Warm regards,</strong><br>
                        <span style="color: #041a35; font-size: 18px; font-weight: bold;">CIVVEST®</span><br>
                        <span style="color: #6c757d;">Investment Management Team</span>
                    </p>
                </div>
                
                <div class="footer">
                    <div class="logo-footer">CIVVEST®</div>
                    <p>© ${new Date().getFullYear()} Civvest. All rights reserved.</p>
                    <p>Transaction ID: #${transactionId} | ${email}</p>
                    <p style="margin-top: 10px; font-size: 11px;">
                        This is an automated notification. Please do not reply directly to this email.
                    </p>
                    <p style="margin-top: 10px;">
                        <a href="https://www.civvest.com/terms-and-services" style="color: #6c757d; margin: 0 10px;">Terms</a> | 
                        <a href="https://www.civvest.com/privacy-policy" style="color: #6c757d; margin: 0 10px;">Privacy</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    const textTemplate = `
        ROI WITHDRAWAL REQUEST RECEIVED - CIVVEST®
        
        Dear ${userName},
        
        We are pleased to inform you that your request for Return on Investment (ROI) withdrawal has been successfully received and is being processed.
        
        WITHDRAWAL DETAILS:
        -------------------
        Amount: $${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        Investment: ${investmentTitle || 'N/A'}
        Transaction ID: #${transactionId}
        Request Date: ${new Date(requestDate).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
        Method: ${withdrawalMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cryptocurrency'}
        Status: PENDING APPROVAL
        
        PROCESSING TIMELINE:
        -------------------
        Please note: All withdrawals are subject to internal verification and approval. 
        Kindly allow up to 24 hours for approval and funds transfer to be completed.
        
        Thank you for your continued trust and investment in our oil and gas production ventures. 
        We value your partnership and remain committed to delivering sustainable returns.
        
        NEED ASSISTANCE?
        ---------------
        📧 admin@civvest.com
        🌐 www.civvest.com
        
        Warm regards,
        CIVVEST®
        Investment Management Team
        
        ---
        © ${new Date().getFullYear()} Civvest. All rights reserved.
        Transaction ID: #${transactionId}
        This is an automated notification.
    `;

    try {
        console.log(`📧 Sending ROI withdrawal request email to: ${email}`);
        console.log(`   Amount: $${amount} | Transaction ID: ${transactionId}`);
        
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Civvest'}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'ROI Withdrawal Request Received - Civvest',
            text: textTemplate,
            html: htmlTemplate,
        });

        console.log(`✅ ROI withdrawal request email sent successfully to ${email}`);
        console.log(`   Message ID: ${info.messageId}`);
        
        return info;
    } catch (error) {
        console.error('❌ FAILED to send ROI withdrawal request email:', error.message);
        throw new Error(`ROI withdrawal email failed: ${error.message}`);
    }
};



