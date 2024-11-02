const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodemailerConfig');

const sendEmail = async ({ to, subject, html }) => {
  let testAccount = await nodemailer.createTestAccount();
   // will use SendGrid API for production for email sending
  const transporter = nodemailer.createTransport(nodemailerConfig);

  return transporter.sendMail({
    from: '"Clasona Dev" <example@gmail.com>', // add random email for sender address
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;