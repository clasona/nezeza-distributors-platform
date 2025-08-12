const sendEmail = require('../utils/sendEmail');

const sendContactMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, inquiryType, subject, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (First Name, Last Name, Email, Subject, and Message)'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Send notification email to admin
    const emailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb, #059669); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Contact Form Message</h2>
            <p style="color: #666; line-height: 1.6;">
              A new message has been submitted through the VeSoko contact form.
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>From:</strong> ${firstName} ${lastName}
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Email:</strong> ${email}
            </div>
            
            ${phone ? `
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Phone:</strong> ${phone}
            </div>
            ` : ''}
            
            ${inquiryType ? `
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Inquiry Type:</strong> ${inquiryType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
            ` : ''}
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Subject:</strong> ${subject}
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Message:</strong><br>
              <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 3px; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Submission Date:</strong> ${new Date().toLocaleString()}
            </div>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #1976d2; font-size: 14px;">
              <strong>Action Required:</strong> Please respond to this inquiry within 24 hours for the best customer experience.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px;">
              This message was sent from VeSoko Contact Form
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email to admin team
    await sendEmail({
      to: 'marketplace@vesoko.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: emailContent,
    });

    // Send confirmation email to the user
    const confirmationEmailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb, #059669); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Message Received</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Thank You for Contacting VeSoko!</h2>
            <p style="color: #666; line-height: 1.6;">
              Dear ${firstName},
            </p>
            <p style="color: #666; line-height: 1.6;">
              Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #333; margin-top: 0;">Your Message Details:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Inquiry Type:</strong> ${inquiryType ? inquiryType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General Inquiry'}</p>
            </div>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #2d5a2d; font-size: 14px;">
              <strong>What's Next?</strong> Our team will review your message and respond via email. For urgent matters, you can also call us at +1 (959) 999-0661.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; line-height: 1.6;">
              Best regards,<br>
              <strong>The VeSoko Team</strong>
            </p>
            <p style="color: #999; font-size: 12px;">
              This is an automated confirmation email from VeSoko
            </p>
          </div>
        </body>
      </html>
    `;

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'Thank you for contacting VeSoko - We\'ll be in touch soon!',
      html: confirmationEmailContent,
    });

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};

module.exports = {
  sendContactMessage
};
