const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodemailerConfig');

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const message = {
    to: to,
    from: {
      email: 'abotgeorge1@gmail.com', // replace with your own email
      name: 'Nezeza Platform',
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

module.exports = sendEmail;
