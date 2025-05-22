const sendEmail = require('./sendEmail');
/*
 * Send an email to verify a user's email address
 * @param {string} name - The user's name
 * @param {string} email - The user's email address
 * @param {string} verificationToken - The verification token for the email address
 * @param {string} origin - The domain where the app is running
 * @returns {Promise<void>} - A Promise that resolves when the email is sent
 */
const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  const verifyEmail = `${origin}/verify-email/status?token=${verificationToken}&email=${email}`;

  const message = `<p>Please click on the link to confirm your email address for your account on Nezeza Platform</p> : 
  <a href="${verifyEmail}">Verify Email</a> </p>`;

  return sendEmail({
    to: email,
    subject: 'Please verify your email address for Nezeza Platform',
    html: `<h4> Dear, ${name}</h4>
    ${message}
    `,
  });
};

module.exports = sendVerificationEmail;
