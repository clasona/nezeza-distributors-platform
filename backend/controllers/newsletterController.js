const sendEmail = require('../utils/sendEmail');

const subscribeToNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
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

    // Send notification email to hello@clasona.com
    const emailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3B82F6, #F97316); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Newsletter Subscription</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">New Subscription Alert</h2>
            <p style="color: #666; line-height: 1.6;">
              A new user has subscribed to VeSoko newsletter updates.
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Email:</strong> ${email}
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Subscription Date:</strong> ${new Date().toLocaleString()}
            </div>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #1976d2; font-size: 14px;">
              <strong>Next Steps:</strong> Add this email to your newsletter list and consider reaching out for early access updates.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px;">
              This notification was sent from VeSoko Coming Soon page
            </p>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: 'clasona.us@gmail.com',
      subject: `New Newsletter Subscription - ${email}`,
      html: emailContent,
    });

    res.status(200).json({
      success: true,
      message: 'Thank you for subscribing! We\'ll keep you updated on our launch.'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process subscription. Please try again later.'
    });
  }
};

module.exports = {
  subscribeToNewsletter
};
