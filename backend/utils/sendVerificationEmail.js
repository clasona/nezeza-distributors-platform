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
  const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;

  const message = `<p>Please confirm your email by clicking on the following link : 
  <a href="${verifyEmail}">Verify Email</a> </p>`;

  return sendEmail({
    to: email,
    subject: 'Email Confirmation',
    html: `<h4> Hello, ${name}</h4>
    ${message}
    `,
  });
};

module.exports = sendVerificationEmail;