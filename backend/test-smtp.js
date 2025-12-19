import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function testSMTP() {
    console.log('🔍 Testing SMTP Connection to:', process.env.SMTP_HOST);
    console.log('   Port:', process.env.SMTP_PORT);
    console.log('   User:', process.env.SMTP_USER);
    
    try {
        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');
        
        // Try sending a test email
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_FROM}>`,
            to: process.env.SMTP_USER,
            subject: 'SMTP Test - Civvest',
            text: 'If you receive this, your SMTP setup is working!',
            html: '<p>If you receive this, your SMTP setup is working!</p>'
        });
        
        console.log('✅ Test email sent! Message ID:', info.messageId);
        console.log('\n🎉 Your email configuration is working correctly!');
        
    } catch (error) {
        console.error('❌ SMTP Test Failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Check if SMTP_HOST is correct (should be from cPanel)');
        console.log('2. Verify SMTP_PASS is correct (email account password)');
        console.log('3. Try port 587 with SMTP_SECURE=false');
        console.log('4. Contact Litehosting support for exact SMTP settings');
    }
}

testSMTP();