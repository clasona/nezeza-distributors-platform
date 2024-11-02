const sendEmail = require('./sendEmail');
/* 
 * Send an email to reset a user's password
 * @param {string} name - The user's name
 * @param {string} email - The user's email address
 * @param {string} token - The password reset token
 * @param {string} origin - The domain where the frontend app is running
 * @returns {Promise<void>} - A Promise that resolves when the email is sent
 * 
 */
const sendResetPasswordEmail = async ({ name, email, token, origin }) => {
  const resetURL = `${origin}/user/reset-password?token=${token}&email=${email}`;
  const message = `<p>Please reset password by clicking on the following link : 
  <a href="${resetURL}">Reset Password</a></p>`;

  return sendEmail({
    to: email,
    subject: 'Reset Password',
    html: `<h4>Hello, ${name}</h4>
   ${message}
   `,
  });
};

module.exports = sendResetPasswordEmail;