const { StatusCodes } = require('http-status-codes');
const { sendBuyerPaymentConfirmationEmail } = require('../utils/email/buyerPaymentEmailUtils');
const { sendSellerNewOrderNotificationEmail } = require('../utils/email/sellerOrderEmailUtils');
const sendEmail = require('../utils/sendEmail');

// Test basic email sending
const testBasicEmail = async (req, res) => {
  try {
    const { to, subject = 'Test Email from Nezeza Platform', message = 'This is a test email from your Nezeza platform!' } = req.body;
    
    if (!to) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        error: 'Email recipient (to) is required' 
      });
    }

    console.log(`Sending test email to: ${to}`);
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Test Email from Nezeza Platform</h2>
        <p style="color: #555; line-height: 1.6;">${message}</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; color: #1e40af;">
            <strong>✅ Email Configuration Test Successful!</strong><br>
            Your SendGrid integration is working correctly.
          </p>
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          This email was sent at: ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    await sendEmail({ to, subject, html });
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Test email sent successfully!',
      sentTo: to,
      sentAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to send test email',
      details: error.message
    });
  }
};

// Test buyer payment confirmation email
const testBuyerPaymentEmail = async (req, res) => {
  try {
    const { 
      to, 
      name = 'Test Customer', 
      orderId 
    } = req.body;
    
    if (!to) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        error: 'Email recipient (to) is required' 
      });
    }
    
    if (!orderId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        error: 'Order ID is required for payment confirmation email test' 
      });
    }

    console.log(`Sending buyer payment confirmation test email to: ${to}`);
    
    await sendBuyerPaymentConfirmationEmail({
      name,
      email: to,
      orderId
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Buyer payment confirmation email sent successfully!',
      sentTo: to,
      customerName: name,
      orderId,
      sentAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error sending buyer payment confirmation email:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to send buyer payment confirmation email',
      details: error.message
    });
  }
};

// Test seller order notification email
const testSellerOrderEmail = async (req, res) => {
  try {
    const { 
      sellerStoreId,
      orderId,
      sellerOrderItems = [
        {
          productId: 'test-product-id',
          title: 'Test Product',
          quantity: 2,
          price: 29.99
        }
      ],
      sellerSubtotal = 59.98,
      sellerTax = 4.80,
      sellerShipping = 5.99
    } = req.body;
    
    if (!sellerStoreId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        error: 'Seller store ID is required' 
      });
    }
    
    if (!orderId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        error: 'Order ID is required for seller notification email test' 
      });
    }

    console.log(`Sending seller order notification test email for store: ${sellerStoreId}`);
    
    await sendSellerNewOrderNotificationEmail({
      sellerStoreId,
      orderId,
      sellerOrderItems,
      sellerSubtotal,
      sellerTax,
      sellerShipping
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Seller order notification email sent successfully!',
      sellerStoreId,
      orderId,
      orderTotal: sellerSubtotal + sellerTax + sellerShipping,
      sentAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error sending seller order notification email:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to send seller order notification email',
      details: error.message
    });
  }
};

module.exports = {
  testBasicEmail,
  testBuyerPaymentEmail,
  testSellerOrderEmail
};
