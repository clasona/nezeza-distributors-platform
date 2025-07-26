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

  const message = `
    <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4edda 100%); padding: 30px; border-radius: 12px; margin: 20px 0;">
      <h2 style="color: #1e3a8a; margin: 0 0 20px 0; font-size: 24px;">Welcome to VeSoko!</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for joining VeSoko! To complete your registration and access all features, please verify your email address by clicking the button below:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyEmail}" style="
          background-color: #1e3a8a;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          display: inline-block;
          transition: background-color 0.3s ease;
        ">Verify My Email</a>
      </div>
      <div style="background: #fef3cd; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          ⚠️ <strong>Important:</strong> This verification link will expire in 24 hours for your security.
        </p>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
        Once verified, you'll be able to access your account and start exploring our marketplace platform.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to VeSoko - Please Verify Your Email',
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
            Welcome to the VeSoko community!<br>
            <strong>The VeSoko Team</strong>
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
            If you're having trouble clicking the button, copy and paste this URL into your browser:<br>
            <a href="${verifyEmail}" style="color: #1e3a8a; word-break: break-all;">${verifyEmail}</a>
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = sendVerificationEmail;
