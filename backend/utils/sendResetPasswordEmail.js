const sgMail = require('@sendgrid/mail');
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
  const resetURL = `${origin}/reset-password?token=${token}&email=${email}`;
  const message = `
    <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4edda 100%); padding: 30px; border-radius: 12px; margin: 20px 0;">
      <h2 style="color: #1e3a8a; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        We received a request to reset your password for your VeSoko account. Click the button below to create a new password:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetURL}" style="
          background-color: #1e3a8a;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          display: inline-block;
          transition: background-color 0.3s ease;
        ">Reset My Password</a>
      </div>
      <div style="background: #fef3cd; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          ⚠️ <strong>Security Notice:</strong> This link will expire in 10 minutes for your security.
        </p>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
        If you didn't request this password reset, please ignore this email. Your account remains secure.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your VeSoko Password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e3a8a; font-size: 28px; margin: 0;">VeSoko</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Your Marketplace Platform</p>
        </div>
        
        <h3 style="color: #1f2937; margin: 0 0 10px 0;">Hello, ${name}!</h3>
        
        ${message}
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong>The VeSoko Team</strong>
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
            If you're having trouble clicking the button, copy and paste this URL into your browser:<br>
            <a href="${resetURL}" style="color: #1e3a8a; word-break: break-all;">${resetURL}</a>
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = sendResetPasswordEmail;
