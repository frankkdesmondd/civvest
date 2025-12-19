import nodemailer from 'nodemailer';

// Configure transporter with YOUR Litehosting SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    // Optional: Add debugging
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
});

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
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
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

export const sendContactFormEmail = async (contactData, req = null) => {
  const { name, email, phone, message, accreditedInvestor } = contactData;
  
  // Get IP and User Agent safely
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
      to: 'admin@civvest.com', // Primary recipient
      replyTo: email, // So you can reply directly to the submitter
      subject: `📥 New Contact: ${name} - ${accreditedInvestor ? 'Accredited Investor' : 'General Inquiry'}`,
      text: textTemplate,
      html: htmlTemplate,
    });
    
    console.log('✅ Contact email sent successfully! Message ID:', info.messageId);
    
    // Send confirmation email to the submitter
    await sendConfirmationEmail({ name, email });
    
    return info;
  } catch (error) {
    console.error('❌ Failed to send contact email:', error);
    throw error;
  }
};

// Keep the sendConfirmationEmail function as is
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
          <p>If your matter is urgent, please message us on whatsapp using <a href='https://wa.me/19292481175'>this link <a></p>
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