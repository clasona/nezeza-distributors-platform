const sendEmail = require('../sendEmail');

const sendStoreApplicationEmail = async ({ application, email, firstName, lastName }) => {
  const adminEmail = 'marketplace@vesoko.com';
  
  // Email to applicant
  const applicantSubject = 'VeSoko Store Application Received - Thank You!';
  const applicantHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c5282; margin: 0;">VeSoko</h1>
        <p style="color: #4a5568; margin: 5px 0 0 0;">African Marketplace Platform</p>
      </div>
      
      <div style="background-color: #f7fafc; padding: 30px; border-radius: 8px; border-left: 4px solid #4CAF50;">
        <h2 style="color: #4CAF50; margin-top: 0;">✓ Application Submitted Successfully!</h2>
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">Dear ${firstName} ${lastName},</p>
        
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          Thank you for submitting your store application to VeSoko! We're excited about the possibility of welcoming you to our platform.
        </p>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #2c5282; margin-top: 0;">What happens next?</h3>
          <ul style="color: #4a5568; line-height: 1.8;">
            <li>Our team will review your application within 48 hours</li>
            <li>We'll verify your documents and business information</li>
            <li>You'll receive an email with the application status</li>
            <li>If approved, we'll help you set up your store and start selling</li>
          </ul>
        </div>
        
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          If you have any questions during this process, please don't hesitate to contact our support team.
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      
      <footer style="text-align: center; color: #718096; font-size: 14px;">
        <p style="margin: 10px 0;">Best regards,<br><strong>The VeSoko Team</strong></p>
        <p style="margin: 10px 0;">
          📧 <a href="mailto:marketplace@vesoko.com" style="color: #4CAF50; text-decoration: none;">marketplace@vesoko.com</a>
        </p>
        <p style="margin: 10px 0; font-size: 12px;">
          This email was sent regarding your store application submission.
        </p>
      </footer>
    </div>
  `;
  
  // Email to admin
  const adminSubject = '🔔 New VeSoko Store Application Submitted';
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #fef5e7; padding: 20px; border-radius: 8px; border-left: 4px solid #f6ad55;">
        <h2 style="color: #c05621; margin-top: 0;">📋 New Store Application</h2>
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          A new store application has been submitted and requires review.
        </p>
        
        <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="color: #2c5282; margin-top: 0;">Applicant Details:</h3>
           <p style="margin: 5px 0;"><strong>Application ID:</strong> ${application._id}</p>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p style="color: #2d3748; font-size: 14px; line-height: 1.6;">
          Please log into the admin panel to review this application and take appropriate action.
        </p>
      </div>
      
      <footer style="text-align: center; color: #718096; font-size: 12px; margin-top: 20px;">
        <p>VeSoko Admin Notification System</p>
      </footer>
    </div>
  `;

  try {
    // Send email to applicant
    await sendEmail({ to: email, subject: applicantSubject, html: applicantHtml });
    console.log(`Store application confirmation email sent to seller: ${email}`);

    // Send notification email to admin
    await sendEmail({ to: adminEmail, subject: adminSubject, html: adminHtml });
    console.log(`Store application notification email sent to admin: ${adminEmail}`);
  } catch (error) {
    console.error('Error sending store application emails:', error);
    throw error; // Re-throw to handle in controller if needed
  }
};

module.exports = {
  sendStoreApplicationEmail,
};

