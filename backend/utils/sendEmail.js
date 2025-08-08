const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodemailerConfig');

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
// for production
const sendEmailgreet = async ({ to, subject, html }) => {
  console.log(to);
  const message = {
    to: to,
    from: {
      email: process.env.VERIFIED_EMAIL,
      name: 'VeSoko Platform',
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
// Use production SendGrid for all emails
const sendEmail = async ({ to, subject, html }) => {
  console.log(`Attempting to send email to: ${to}`);
  
  // Check if SendGrid API key is configured
  if (!process.env.SEND_GRID_API_KEY) {
    console.warn('SendGrid API key not configured, using test email service');
    // Fallback to test email service for development
    const transporter = nodemailer.createTransporter(nodemailerConfig);
    return transporter.sendMail({
      from: '"Soko Platform" <admin@gmail.com>',
      to,
      subject,
      html,
    });
  }
  
  // Use SendGrid for production
  const message = {
    to: to,
    from: {
      email: process.env.VERIFIED_EMAIL || 'support@vesoko.com',
      name: 'Soko Platform',
    },
    subject: subject,
    html: html,
  };

  try {
    const [response, body] = await sgMail.send(message);
    console.log('Email sent successfully via SendGrid to:', to);
    return response;
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    
    // Fallback to test email service if SendGrid fails
    console.log('Falling back to test email service...');
    const transporter = nodemailer.createTransporter(nodemailerConfig);
    return transporter.sendMail({
      from: '"Soko Platform" <admin@gmail.com>',
      to,
      subject,
      html,
    });
  }
};

module.exports = sendEmail;
