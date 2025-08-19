const sendEmail = require('../sendEmail');
const crypto = require('crypto');

/**
 * Send approval email with password setup link to the applicant
 * @param {Object} options - Email options
 * @param {string} options.email - Applicant's email
 * @param {string} options.firstName - Applicant's first name
 * @param {string} options.lastName - Applicant's last name
 * @param {string} options.storeName - Store name
 * @param {string} options.storeType - Store type
 * @param {string} options.passwordSetupToken - Token for password setup
 * @param {string} options.origin - Frontend origin URL
 */
const sendStoreApprovalEmail = async ({
  email,
  firstName,
  lastName,
  storeName,
  storeType,
  passwordSetupToken,
  origin
}) => {
  const passwordSetupURL = `${origin}/sellers/setup-password?token=${passwordSetupToken}&email=${email}`;
  
  const subject = '🎉 Your VeSoko Store Application Has Been Approved!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c5282; margin: 0;">VeSoko</h1>
        <p style="color: #4a5568; margin: 5px 0 0 0;">African Marketplace Platform</p>
      </div>
      
      <div style="background-color: #f0fff4; padding: 30px; border-radius: 8px; border-left: 4px solid #48bb78;">
        <h2 style="color: #48bb78; margin-top: 0;">🎉 Congratulations! Your Store Application is Approved!</h2>
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">Dear ${firstName} ${lastName},</p>
        
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          We're excited to inform you that your store application for <strong>"${storeName}"</strong> has been approved! 
          Welcome to the VeSoko marketplace family.
        </p>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #2c5282; margin-top: 0;">Store Details:</h3>
          <ul style="color: #4a5568; line-height: 1.8;">
            <li><strong>Store Name:</strong> ${storeName}</li>
            <li><strong>Store Type:</strong> ${storeType.charAt(0).toUpperCase() + storeType.slice(1)}</li>
            <li><strong>Account Email:</strong> ${email}</li>
          </ul>
        </div>
        
        <div style="background-color: #fff5f5; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #f56565;">
          <h3 style="color: #e53e3e; margin-top: 0;">🔒 Complete Your Account Setup</h3>
          <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
            To access your store dashboard, you need to set up your account password. Click the button below to create your secure password:
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${passwordSetupURL}" style="
              background-color: #2c5282;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              display: inline-block;
            ">Set Up My Password</a>
          </div>
          <p style="color: #e53e3e; font-size: 14px; line-height: 1.6;">
            ⚠️ <strong>Important:</strong> This link will expire in 24 hours for security reasons.
          </p>
        </div>
        
        <div style="background-color: #edf2f7; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #2c5282; margin-top: 0;">Next Steps:</h3>
          <ol style="color: #4a5568; line-height: 1.8;">
            <li>Click the "Set Up My Password" button above</li>
            <li>Create a secure password for your account</li>
            <li>Log into your store dashboard</li>
            <li>Complete your store stripe account setup and add your first products</li>
            <li>Start selling on VeSoko!</li>
          </ol>
        </div>
        
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          If you have any questions or need assistance getting started, our support team is here to help.
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      
      <footer style="text-align: center; color: #718096; font-size: 14px;">
        <p style="margin: 10px 0;">Welcome to VeSoko!<br><strong>The VeSoko Team</strong></p>
        <p style="margin: 10px 0;">
          📧 <a href="mailto:marketplace@vesoko.com" style="color: #48bb78; text-decoration: none;">marketplace@vesoko.com</a>
        </p>
        <p style="margin: 10px 0; font-size: 12px;">
          If you're having trouble clicking the button, copy and paste this URL into your browser:<br>
          <a href="${passwordSetupURL}" style="color: #2c5282; word-break: break-all;">${passwordSetupURL}</a>
        </p>
      </footer>
    </div>
  `;
  
  try {
    await sendEmail({ to: email, subject, html });
    console.log(`Store approval email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending store approval email:', error);
    throw error;
  }
};

/**
 * Send decline email to the applicant
 * @param {Object} options - Email options
 * @param {string} options.email - Applicant's email
 * @param {string} options.firstName - Applicant's first name
 * @param {string} options.lastName - Applicant's last name
 * @param {string} options.storeName - Store name
 * @param {string} options.reason - Decline reason
 */
const sendStoreDeclineEmail = async ({
  email,
  firstName,
  lastName,
  storeName,
  reason
}) => {
  const subject = 'VeSoko Store Application Update - Action Required';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c5282; margin: 0;">VeSoko</h1>
        <p style="color: #4a5568; margin: 5px 0 0 0;">African Marketplace Platform</p>
      </div>
      
      <div style="background-color: #fef5e7; padding: 30px; border-radius: 8px; border-left: 4px solid #f6ad55;">
        <h2 style="color: #c05621; margin-top: 0;">📋 Store Application Update Required</h2>
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">Dear ${firstName} ${lastName},</p>
        
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          Thank you for your interest in joining VeSoko with your store "<strong>${storeName}</strong>". 
          After reviewing your application, we need some additional information or corrections before we can proceed.
        </p>
        
        <div style="background-color: #fff5f5; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #f56565;">
          <h3 style="color: #e53e3e; margin-top: 0;">📝 Required Action:</h3>
          <p style="color: #2d3748; font-size: 16px; line-height: 1.6; font-style: italic;">
            "${reason}"
          </p>
        </div>
        
        <div style="background-color: #e6fffa; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #319795; margin-top: 0;">Next Steps:</h3>
          <ol style="color: #4a5568; line-height: 1.8;">
            <li>Review the feedback provided above</li>
            <li>Make the necessary corrections to your application</li>
            <li>Submit a new application with the updated information</li>
            <li>Our team will review your resubmission within 48 hours</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://vesoko.com/store-application" style="
            background-color: #319795;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            display: inline-block;
          ">Submit New Application</a>
        </div>
        
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          We appreciate your interest in VeSoko and look forward to welcoming you to our marketplace once 
          these items are addressed. If you have any questions about the feedback or need assistance, 
          please don't hesitate to reach out to our support team.
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      
      <footer style="text-align: center; color: #718096; font-size: 14px;">
        <p style="margin: 10px 0;">Best regards,<br><strong>The VeSoko Team</strong></p>
        <p style="margin: 10px 0;">
          📧 <a href="mailto:marketplace@vesoko.com" style="color: #319795; text-decoration: none;">marketplace@vesoko.com</a>
        </p>
        <p style="margin: 10px 0; font-size: 12px;">
          This email was sent regarding your store application submission.
        </p>
      </footer>
    </div>
  `;
  
  try {
    await sendEmail({ to: email, subject, html });
    console.log(`Store decline email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending store decline email:', error);
    throw error;
  }
};

/**
 * Send admin notification email about processed application
 * @param {Object} options - Email options
 * @param {string} options.action - 'approved' or 'declined'
 * @param {string} options.storeName - Store name
 * @param {string} options.applicantEmail - Applicant's email
 * @param {string} options.processedBy - Admin who processed the application
 */
const sendAdminNotificationEmail = async ({
  action,
  storeName,
  applicantEmail,
  processedBy
}) => {
  const adminEmail = 'clasona.us@gmail.com';
  const subject = `📋 Store Application ${action.charAt(0).toUpperCase() + action.slice(1)} - ${storeName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: ${action === 'approved' ? '#f0fff4' : '#fef5e7'}; padding: 20px; border-radius: 8px; border-left: 4px solid ${action === 'approved' ? '#48bb78' : '#f6ad55'};">
        <h2 style="color: ${action === 'approved' ? '#48bb78' : '#c05621'}; margin-top: 0;">
          📋 Store Application ${action === 'approved' ? 'Approved' : 'Declined'}
        </h2>
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          A store application has been ${action} and the applicant has been notified.
        </p>
        
        <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="color: #2c5282; margin-top: 0;">Application Details:</h3>
          <p style="margin: 5px 0;"><strong>Store Name:</strong> ${storeName}</p>
          <p style="margin: 5px 0;"><strong>Applicant Email:</strong> ${applicantEmail}</p>
          <p style="margin: 5px 0;"><strong>Action:</strong> ${action.charAt(0).toUpperCase() + action.slice(1)}</p>
          <p style="margin: 5px 0;"><strong>Processed By:</strong> ${processedBy}</p>
          <p style="margin: 5px 0;"><strong>Processed At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <p style="color: #2d3748; font-size: 14px; line-height: 1.6;">
          ${action === 'approved' 
            ? 'The applicant has been sent password setup instructions and will be able to access their store dashboard once they complete the setup.'
            : 'The applicant has been notified about the required changes and can resubmit their application.'
          }
        </p>
      </div>
      
      <footer style="text-align: center; color: #718096; font-size: 12px; margin-top: 20px;">
        <p>VeSoko Admin Notification System</p>
      </footer>
    </div>
  `;
  
  try {
    await sendEmail({ to: adminEmail, subject, html });
    console.log(`Admin notification email sent for ${action} action on ${storeName}`);
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw error;
  }
};

module.exports = {
  sendStoreApprovalEmail,
  sendStoreDeclineEmail,
  sendAdminNotificationEmail,
};
