const sendEmail = require('./sendEmail');

/**
 * Send password setup email for approved store applications
 * @param {Object} options - Email options
 * @param {string} options.name - User's name
 * @param {string} options.email - User's email address
 * @param {string} options.passwordSetupToken - Password setup token
 * @param {string} options.storeName - Store name
 * @param {string} options.origin - Frontend origin URL
 */
const sendPasswordSetupEmail = async ({
  name,
  email,
  passwordSetupToken,
  storeName,
  origin,
}) => {
  const passwordSetupURL = `${origin}/setup-password?token=${passwordSetupToken}&email=${email}`;
  
  const message = `
    <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4edda 100%); padding: 30px; border-radius: 12px; margin: 20px 0;">
      <h2 style="color: #1e3a8a; margin: 0 0 20px 0; font-size: 24px;">🎉 Your Store Application Was Approved!</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Congratulations! Your store "<strong>${storeName}</strong>" has been approved for VeSoko marketplace. 
        To complete your account setup and start selling, please create your secure password:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${passwordSetupURL}" style="
          background-color: #1e3a8a;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          display: inline-block;
          transition: background-color 0.3s ease;
        ">Set Up My Password</a>
      </div>
      <div style="background: #fef3cd; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          ⚠️ <strong>Security Notice:</strong> This link will expire in 24 hours for your security.
        </p>
      </div>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="color: #1e3a8a; margin-top: 0;">What happens next?</h3>
        <ul style="color: #4a5568; line-height: 1.8;">
          <li>Click the "Set Up My Password" button above</li>
          <li>Create a secure password for your account</li>
          <li>Log into your store dashboard</li>
          <li>Complete your store profile</li>
          <li>Add your products and start selling!</li>
        </ul>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
        Welcome to the VeSoko marketplace family! Our support team is here to help you get started.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: '🎉 Welcome to VeSoko - Set Up Your Store Password',
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
            Welcome to VeSoko!<br>
            <strong>The VeSoko Team</strong>
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
            If you're having trouble clicking the button, copy and paste this URL into your browser:<br>
            <a href="${passwordSetupURL}" style="color: #1e3a8a; word-break: break-all;">${passwordSetupURL}</a>
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = sendPasswordSetupEmail;
