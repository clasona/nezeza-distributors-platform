const sendEmail = require('./sendEmail');

/**
 * Send an email with verification code
 * @param {string} email - The user's email address
 * @param {string} verificationCode - The 6-digit verification code
 * @param {string} name - The user's name (optional)
 * @returns {Promise<void>} - A Promise that resolves when the email is sent
 */
const sendVerificationCodeEmail = async ({
  email,
  verificationCode,
  name = 'User',
}) => {
  const message = `
    <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4edda 100%); padding: 30px; border-radius: 12px; margin: 20px 0;">
      <h2 style="color: #1e3a8a; margin: 0 0 20px 0; font-size: 24px;">Email Verification</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        To verify your email address, please use the verification code below:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="
          background-color: #f3f4f6;
          border: 2px dashed #1e3a8a;
          padding: 20px;
          border-radius: 8px;
          display: inline-block;
          font-family: 'Courier New', monospace;
        ">
          <span style="
            font-size: 32px;
            font-weight: 700;
            color: #1e3a8a;
            letter-spacing: 4px;
          ">${verificationCode}</span>
        </div>
      </div>
      <div style="background: #fef3cd; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          ⚠️ <strong>Important:</strong> This verification code will expire in 10 minutes for your security.
        </p>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
        Enter this code in the verification form to complete your email verification process.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'VeSoko - Email Verification Code',
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
            If you didn't request this verification code, please ignore this email.<br>
            <strong>The VeSoko Team</strong>
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
            This code is valid for 10 minutes only. Do not share this code with anyone.
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = sendVerificationCodeEmail;
