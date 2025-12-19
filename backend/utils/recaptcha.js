// utils/recaptcha.js

/**
 * Verify reCAPTCHA v2 token with Google
 * @param {string} token - The reCAPTCHA token from the frontend
 * @returns {Promise<boolean>} - True if verification succeeds
 */
export const verifyRecaptcha = async (token) => {
  if (!token) {
    throw new Error('No reCAPTCHA token provided');
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    throw new Error('RECAPTCHA_SECRET_KEY not configured in environment variables');
  }

  try {
    const recaptchaResponse = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secretKey}&response=${token}`
      }
    );

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      console.error('reCAPTCHA verification failed:', recaptchaData['error-codes']);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error.message);
    return false;
  }
};