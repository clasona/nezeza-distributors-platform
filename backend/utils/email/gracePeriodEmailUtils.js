const sendEmail = require('../sendEmail');

const { PLATFORM_FEE_PERCENTAGE } = require('../payment/feeCalculationUtil');

/**
 * Send grace period ending notification to seller (2 days before fees start)
 * @param {Object} store - Store object
 * @param {Object} owner - Store owner user object
 * @param {number} daysRemaining - Days remaining in grace period
 */
async function sendGracePeriodEndingNotification(store, owner, daysRemaining = 2) {
  const platformFeePercent = (PLATFORM_FEE_PERCENTAGE * 100).toFixed(0);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Platform Fees Starting Soon - VeSoko</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .warning-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .fee-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd; }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .highlight { color: #e17055; font-weight: bold; }
        .success { color: #00b894; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Important Notice: Platform Fees Starting Soon</h1>
          <p>Your ${daysRemaining}-day grace period is ending</p>
        </div>
        
        <div class="content">
          <div class="warning-box">
            <h2>⏰ Platform Fees Begin in ${daysRemaining} Days</h2>
            <p>Hello <strong>${owner.firstName} ${owner.lastName}</strong>,</p>
            <p>Your grace period for <strong>${store.name}</strong> is ending soon. Starting <strong>${store.gracePeriodEnd.toLocaleDateString()}</strong>, platform fees will be applied to your sales.</p>
          </div>
          
          <div class="fee-details">
            <h3>What This Means for You:</h3>
            <ul>
              <li><strong>Platform Fee:</strong> <span class="highlight">${platformFeePercent}%</span> of your product listing price</li>
              <li><strong>Your Earnings:</strong> You'll receive <span class="success">${100 - platformFeePercent}%</span> of your listed price + taxes</li>
              <li><strong>No Hidden Costs:</strong> This fee is already included in your listing price</li>
              <li><strong>What You Get:</strong> Continued access to our marketplace, payment processing, customer support, and marketing tools</li>
            </ul>
          </div>
          
          <div class="fee-details">
            <h3>📈 Your Grace Period Benefits</h3>
            <p>During your ${process.env.PLATFORM_FEE_GRACE_PERIOD_DAYS || 60}-day grace period, you've enjoyed:</p>
            <ul>
              <li>✅ <strong>Zero platform fees</strong> on all sales</li>
              <li>✅ Full access to all marketplace features</li>
              <li>✅ Customer support and onboarding assistance</li>
              <li>✅ Marketing exposure to our customer base</li>
            </ul>
          </div>
          
          <div class="fee-details">
            <h3>🚀 What Happens Next?</h3>
            <p>Starting <strong>${store.gracePeriodEnd.toLocaleDateString()}</strong>:</p>
            <ul>
              <li>Platform fees will automatically apply to new orders</li>
              <li>You'll continue to receive detailed sales reports</li>
              <li>All existing product listings remain active</li>
              <li>No action required from you - everything continues seamlessly</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/retailer" class="btn">Visit Your Dashboard</a>
            <a href="${process.env.CLIENT_URL}/sellers" class="btn">Learn More About Pricing</a>
          </div>
          
          <div class="warning-box">
            <h3>💡 Questions or Concerns?</h3>
            <p>We're here to help! If you have any questions about platform fees or need assistance with your store, please don't hesitate to contact us.</p>
            <p><strong>Email:</strong> team@vesoko.com<br>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for being part of the VeSoko marketplace!</p>
          <p>Best regards,<br>The VeSoko Team</p>
          <hr>
          <p><small>This is an automated notification. Please do not reply to this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
    IMPORTANT NOTICE: Platform Fees Starting Soon
    
    Hello ${owner.firstName} ${owner.lastName},
    
    Your grace period for "${store.name}" is ending soon. Starting ${store.gracePeriodEnd.toLocaleDateString()}, platform fees will be applied to your sales.
    
    WHAT THIS MEANS:
    - Platform Fee: ${platformFeePercent}% of your product listing price
    - Your Earnings: ${100 - platformFeePercent}% of your listed price + taxes
    - No Hidden Costs: This fee is already included in your listing price
    
    YOUR GRACE PERIOD BENEFITS:
    During your ${process.env.PLATFORM_FEE_GRACE_PERIOD_DAYS || 60}-day grace period, you've enjoyed zero platform fees on all sales.
    
    WHAT HAPPENS NEXT:
    Starting ${store.gracePeriodEnd.toLocaleDateString()}:
    - Platform fees will automatically apply to new orders
    - You'll continue to receive detailed sales reports
    - All existing product listings remain active
    - No action required from you
    
    Questions? Contact us at support@vesoko.com or +250 123 456 789
    
    Thank you for being part of the VeSoko marketplace!
    
    Best regards,
    The VeSoko Team
  `;

  try {
    await sendEmail({
      to: owner.email,
      subject: `Platform Fees Starting in ${daysRemaining} Days - ${store.name}`,
      html: htmlContent
    });
    console.log(`Grace period ending notification sent to ${owner.email} for store ${store.name}`);
    return true;
  } catch (error) {
    console.error('Error sending grace period ending notification:', error);
    throw error;
  }
}

/**
 * Send platform fees activation confirmation to seller
 * @param {Object} store - Store object
 * @param {Object} owner - Store owner user object
 */
async function sendPlatformFeesActivatedNotification(store, owner) {
  const platformFeePercent = (PLATFORM_FEE_PERCENTAGE * 100).toFixed(0);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Platform Fees Now Active - VeSoko</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .info-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .fee-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd; }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .highlight { color: #e17055; font-weight: bold; }
        .success { color: #00b894; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Platform Fees Now Active</h1>
          <p>Your grace period has ended</p>
        </div>
        
        <div class="content">
          <div class="info-box">
            <h2>✅ Platform Fees Are Now Active</h2>
            <p>Hello <strong>${owner.firstName} ${owner.lastName}</strong>,</p>
            <p>The grace period for <strong>${store.name}</strong> has ended. Platform fees are now being applied to your sales as of today.</p>
          </div>
          
          <div class="fee-details">
            <h3>Current Fee Structure:</h3>
            <ul>
              <li><strong>Platform Fee:</strong> <span class="highlight">${platformFeePercent}%</span> of your product listing price</li>
              <li><strong>Your Earnings:</strong> <span class="success">${100 - platformFeePercent}%</span> of your listed price + taxes</li>
              <li><strong>Fee Collection:</strong> Automatically deducted from each sale</li>
              <li><strong>Transparent Reporting:</strong> Detailed breakdowns in your dashboard</li>
            </ul>
          </div>
          
          <div class="fee-details">
            <h3>📊 What You Continue to Receive</h3>
            <ul>
              <li>✅ Access to our growing customer base</li>
              <li>✅ Secure payment processing</li>
              <li>✅ Marketing and promotional opportunities</li>
              <li>✅ Customer support and dispute resolution</li>
              <li>✅ Analytics and sales reporting</li>
              <li>✅ Mobile-friendly storefront</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/retailer" class="btn">View Your Dashboard</a>
          </div>
          
          <div class="info-box">
            <h3>📈 Growing Your Business</h3>
            <p>Now that you're a full marketplace partner, consider:</p>
            <ul>
              <li>Adding new products to expand your catalog</li>
              <li>Optimizing your product descriptions and images</li>
              <li>Participating in promotional campaigns</li>
              <li>Engaging with customer reviews and feedback</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing VeSoko as your marketplace partner!</p>
          <p>Best regards,<br>The VeSoko Team</p>
          <hr>
          <p><small>Questions? Contact support@vesoko.com or +250 123 456 789</small></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    PLATFORM FEES NOW ACTIVE
    
    Hello ${owner.firstName} ${owner.lastName},
    
    The grace period for "${store.name}" has ended. Platform fees are now being applied to your sales as of today.
    
    CURRENT FEE STRUCTURE:
    - Platform Fee: ${platformFeePercent}% of your product listing price
    - Your Earnings: ${100 - platformFeePercent}% of your listed price + taxes
    - Fee Collection: Automatically deducted from each sale
    - Transparent Reporting: Detailed breakdowns in your dashboard
    
    WHAT YOU CONTINUE TO RECEIVE:
    - Access to our growing customer base
    - Secure payment processing
    - Marketing and promotional opportunities
    - Customer support and dispute resolution
    - Analytics and sales reporting
    - Mobile-friendly storefront
    
    Visit your dashboard: ${process.env.CLIENT_URL}/seller-dashboard
    
    Thank you for choosing VeSoko as your marketplace partner!
    
    Best regards,
    The VeSoko Team
    
    Questions? Contact support@vesoko.com or +250 123 456 789
  `;

  try {
    await sendEmail({
      to: owner.email,
      subject: `Platform Fees Now Active - ${store.name}`,
      html: htmlContent
    });
    console.log(`Platform fees activated notification sent to ${owner.email} for store ${store.name}`);
    return true;
  } catch (error) {
    console.error('Error sending platform fees activated notification:', error);
    throw error;
  }
}

module.exports = {
  sendGracePeriodEndingNotification,
  sendPlatformFeesActivatedNotification
};
