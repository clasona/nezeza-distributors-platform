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

    // Send confirmation email to subscriber
    const subscriberEmailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f7fa;">
          <div style="background: linear-gradient(135deg, #3B82F6, #F97316); padding: 30px; text-align: center; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 Welcome to VeSoko!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">You're now subscribed to our premium features updates</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
            <h2 style="color: #333; margin-top: 0; font-size: 22px;">🚀 Get Ready for Amazing Features!</h2>
            <p style="color: #666; line-height: 1.8; font-size: 16px;">
              Thank you for subscribing to VeSoko premium feature updates! You'll be the first to know when we launch exciting new capabilities that will supercharge your business.
            </p>
            
            <div style="background: linear-gradient(135deg, #f8f9ff, #e8f3ff); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <h3 style="color: #3B82F6; margin-top: 0; font-size: 18px;">📅 What's Coming Soon:</h3>
              <ul style="color: #555; line-height: 1.6; margin: 10px 0; padding-left: 20px;">
                <li><strong>Advanced Analytics</strong> - Deep business insights (Q1 2025)</li>
                <li><strong>AI Assistant</strong> - Smart automation & recommendations (Q1 2025)</li>
                <li><strong>Email Marketing</strong> - Automated campaigns (Q2 2025)</li>
                <li><strong>Multi-Channel Selling</strong> - Amazon, eBay integration (Q2 2025)</li>
                <li><strong>Mobile App</strong> - Custom branded app (Q3 2025)</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://vesoko.com/retailer" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #F97316); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 5px 15px rgba(59,130,246,0.3); transition: all 0.3s ease;">🏪 Visit Your Dashboard</a>
            </div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
            <h3 style="color: #333; margin-top: 0; font-size: 18px;">💡 While You Wait...</h3>
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">Make the most of your current VeSoko features:</p>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>📊 Check your basic analytics in the dashboard</li>
              <li>📦 Manage your inventory and add new products</li>
              <li>💰 Track payments and revenue</li>
              <li>👥 Connect with customers</li>
            </ul>
          </div>
          
          <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;">
            <h4 style="color: #0369a1; margin-top: 0;">🔔 Stay Connected</h4>
            <p style="color: #0369a1; margin: 10px 0; font-size: 14px;">Follow us for updates and tips:</p>
            <div style="margin: 15px 0;">
              <a href="https://facebook.com/vesoko" style="margin: 0 10px; color: #3B82F6; text-decoration: none;">Facebook</a> |
              <a href="https://twitter.com/vesoko" style="margin: 0 10px; color: #3B82F6; text-decoration: none;">Twitter</a> |
              <a href="https://instagram.com/vesoko" style="margin: 0 10px; color: #3B82F6; text-decoration: none;">Instagram</a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; margin: 5px 0;">
              You're receiving this because you subscribed to VeSoko premium feature updates.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0;">
              VeSoko - Empowering African Businesses | © ${new Date().getFullYear()}
            </p>
          </div>
        </body>
      </html>
    `;

    // Send notification email to marketplace@vesoko.com
    const adminEmailContent = `
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

    // Send both emails concurrently
    try {
      await Promise.all([
        // Send welcome email to subscriber
        sendEmail({
          to: email,
          subject: '🎉 Welcome to VeSoko - Get Ready for Premium Features!',
          html: subscriberEmailContent,
        }),
        // Send notification email to admin
        sendEmail({
          to: 'marketplace@vesoko.com',
          subject: `New Newsletter Subscription - ${email}`,
          html: adminEmailContent,
        })
      ]);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails, but log it
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for subscribing! Check your email for a warm welcome and details about upcoming features.'
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
