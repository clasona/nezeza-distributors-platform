const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodemailerConfig');

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
// for production
const sendEmail = async ({ to, subject, html }) => {
  console.log(to);
  const message = {
    to: to,
    from: {
      email: 'abotgeorge1@gmail.com', // replace with your own email
      name: 'Soko Platform',
    },
    subject: subject,
    html: html,
  };

  try {
    const [response, body] = await sgMail.send(message);
    console.log('Email sent successfully to:', to);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('Error response body:', error.response.body);
    }
    throw error;
  }
};
// for testing
const sendEmailEthereal = async ({ to, subject, html }) => {
  let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport(nodemailerConfig);
  console.log(to);
  return transporter.sendMail({
    from: '"Soko Platform" <admin@gmail.com>', // sender address
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
