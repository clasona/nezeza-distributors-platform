const sgMail = require('@sendgrid/mail');
const sendEmail = require('../sendEmail');

const { PLATFORM_FEE_GRACE_PERIOD_DAYS } = require('../payment/feeCalculationUtil');
const getClientUrl = require('../getClientUrl');

/**
 * Send store activation and grace period welcome email
 * @param {Object} store - Store object
 * @param {Object} owner - Store owner user object
 */
async function sendStoreActivationWelcomeEmail(store, owner) {
  const gracePeriodDays = process.env.PLATFORM_FEE_GRACE_PERIOD_DAYS || 60;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to VeSoko - Your Store is Live! 🎉</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .celebration-box { background: #e8f5e8; border: 2px solid #4CAF50; padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center; }
        .grace-period-box { background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); color: white; padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center; }
        .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd; }
        .btn { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 10px; font-weight: bold; }
        .btn-secondary { background: #28a745; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .highlight { color: #e17055; font-weight: bold; font-size: 18px; }
        .success { color: #00b894; font-weight: bold; }
        .emoji { font-size: 24px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; padding: 10px; }
        .stat-number { font-size: 24px; font-weight: bold; color: #ffd700; }
        .stat-label { font-size: 14px; color: rgba(255,255,255,0.9); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">🎉 🛍️ 🚀</div>
          <h1>Welcome to VeSoko!</h1>
          <p>Your store is now LIVE and ready for business</p>
        </div>
        
        <div class="content">
          <div class="celebration-box">
            <h2 class="success">🎊 Congratulations ${owner.firstName}!</h2>
            <p><strong>${store.name}</strong> is now active on the VeSoko marketplace!</p>
            <p>You've successfully completed the setup process and can now start selling your products to customers worldwide.</p>
          </div>
          
          <div class="grace-period-box">
            <div class="emoji">🎁</div>
            <h2>Your ${gracePeriodDays}-Day Grace Period Starts NOW!</h2>
            <div class="stats">
              <div class="stat">
                <div class="stat-number">${gracePeriodDays}</div>
                <div class="stat-label">Days of Zero Fees</div>
              </div>
              <div class="stat">
                <div class="stat-number">100%</div>
                <div class="stat-label">Of Sales Revenue</div>
              </div>
              <div class="stat">
                <div class="stat-number">$0</div>
                <div class="stat-label">Platform Fees</div>
              </div>
            </div>
            <p>For the next <strong>${gracePeriodDays} days</strong>, you'll pay <strong>ZERO platform fees</strong>! 
            This means you keep 100% of your product sales revenue.</p>
            <p><small>Grace period ends on: <strong>${store.gracePeriodEnd ? store.gracePeriodEnd.toLocaleDateString() : 'TBD'}</strong></small></p>
          </div>
          
          <div class="feature-list">
            <h3>🚀 What You Can Do Now:</h3>
            <ul>
              <li><strong>✅ Connect Stripe Account:</strong> Complete payment setup to receive earnings</li>
              <li><strong>✅ Add Products:</strong> Upload your product catalog and start selling immediately</li>
              <li><strong>✅ Complete and Customize Your Store:</strong> Personalize your store design and branding with logo, and more</li>
              <li><strong>✅ Monitor Analytics:</strong> Track your sales performance in the dashboard</li>
            </ul>
          </div>
          
          <div class="feature-list">
            <h3>📈 Tips for Success During Your Grace Period:</h3>
            <ul>
              <li>🎯 <strong>Upload Quality Photos:</strong> High-quality images increase sales by up to 40%</li>
              <li>🔍 <strong>Optimize Product Titles:</strong> Use keywords customers search for</li>
              <li>💰 <strong>Competitive Pricing:</strong> Research market prices for your products</li>
              <li>⭐ <strong>Excellent Service:</strong> Fast shipping and great customer service build reviews</li>
              <li>📊 <strong>Track Performance:</strong> Monitor which products perform best</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getClientUrl(req)}/retailer" class="btn">🏪 Go to Your Dashboard</a>
            <a href="${getClientUrl(req)}/retailer/inventory/new-product" class="btn btn-secondary">📦 Add Your First Product</a>
          </div>
          
          <div class="feature-list">
            <h3>🤝 We're Here to Help!</h3>
            <p>Our support team is ready to help you succeed:</p>
            <ul>
              <li>📧 <strong>Email Support:</strong> team@vesoko.com</li>
              <li>📞 <strong>Phone:</strong> +250 123 456 789</li>
              <li>📚  <a href="${getClientUrl(req)}/sellers" class="btn"><strong>Seller Hub:</strong></a> Comprehensive guides and tutorials</li>
            </ul>
          </div>
          
          <div class="celebration-box">
            <h3>🎯 Ready to Start Your Journey?</h3>
            <p>You have <span class="highlight">${gracePeriodDays} days</span> of zero platform fees ahead of you. 
            Make the most of this opportunity to establish your presence on VeSoko!</p>
            <p><strong>Your success is our success. Let's build something amazing together!</strong></p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Welcome to the VeSoko family! 🎉</strong></p>
          <p>Best regards,<br>The VeSoko Team</p>
          <hr>
          <p><small>This email was sent because your store was activated. Questions? Reply to this email or contact support.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      to: owner.email,
      subject: `🎉 Welcome to VeSoko! ${store.name} is now LIVE with ${gracePeriodDays} days of zero fees!`,
      html: htmlContent,
    });
    console.log(`Store activation welcome email sent to ${owner.email} for store ${store.name}`);
    return true;
  } catch (error) {
    console.error('Error sending store activation welcome email:', error);
    throw error;
  }
}

module.exports = {
  sendStoreActivationWelcomeEmail
};
