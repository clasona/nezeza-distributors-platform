const sendEmail = require('./sendEmail');
const sendNotification = async ({ email, firstName, subject, message }) => {
  const greeting = firstName ? `Hello, ${firstName}` : 'Store Order Shipped';
  return sendEmail({
    to: email,
    subject,
    html: `<h4>${greeting}</h4>
   ${message}
   `,
  });
  ///console.log(`Notification sent to user ${userId}: ${subject} - ${message}`);
};

module.exports = sendNotification;
