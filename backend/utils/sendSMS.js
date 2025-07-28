const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Send SMS using Twilio
 * @param {string} to - The recipient phone number (E.164 format)
 * @param {string} message - The SMS message content
 * @returns {Promise<Object>} - Twilio response object
 */
const sendSMS = async ({ to, message }) => {
  try {
    console.log('Sending SMS to:', to);
    
    // Use either phone number or messaging service SID
    const messageConfig = {
      body: message,
      to: to
    };
    
    // Add either 'from' (phone number) or 'messagingServiceSid'
    if (process.env.TWILIO_PHONE_NUMBER) {
      messageConfig.from = process.env.TWILIO_PHONE_NUMBER;
    } else if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
      messageConfig.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    } else {
      throw new Error('Either TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID must be configured');
    }
    
    const response = await client.messages.create(messageConfig);

    console.log('SMS sent successfully to:', to);
    console.log('Message SID:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error);
    if (error.code) {
      console.error('Twilio error code:', error.code);
      console.error('Twilio error message:', error.message);
    }
    throw error;
  }
};

module.exports = sendSMS;
