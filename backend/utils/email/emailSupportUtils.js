const sendEmail = require('../sendEmail');

/**
 * Base responsive email template with mobile optimization
 */
const getBaseEmailTemplate = (content, title = 'Soko Support') => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${title}</title>
      <style>
        /* Reset styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        /* Base styles */
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
          width: 100% !important;
          min-width: 100%;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        
        /* Container */
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .email-wrapper {
          padding: 20px;
          background-color: #f5f5f5;
        }
        
        /* Header */
        .email-header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          padding: 30px 20px;
          text-align: center;
          color: white;
        }
        
        .email-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .email-header .tagline {
          font-size: 14px;
          opacity: 0.9;
          margin-top: 5px;
        }
        
        /* Content */
        .email-content {
          padding: 40px 30px;
        }
        
        .email-title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
          line-height: 1.3;
        }
        
        .email-text {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        
        /* Info boxes */
        .info-box {
          background:white; 
          border-left: 4px solid #2563eb;
          padding: 20px;
          margin: 25px 0;
          border-radius: 0 6px 6px 0;
        }
        
        .info-box h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
        }
        
        .info-item {
          margin: 8px 0;
          font-size: 15px;
          color: #374151;
        }
        
        .info-item strong {
          color: #1f2937;
          font-weight: 600;
        }
        
        /* Buttons */
        .button-container {
          text-align: center;
          margin: 35px 0;
        }
        
        .btn {
          display: inline-block;
          padding: 16px 32px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          min-width: 200px;
        }
        
        .btn:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
        }
        
        .btn-success {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
        
        .btn-warning {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
        }
        
        .btn-danger {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }
        
        /* Alert boxes */
        .alert {
          padding: 16px 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid;
        }
        
        .alert-success {
          background-color: #f0fdf4;
          border-color: #22c55e;
          color: #166534;
        }
        
        .alert-warning {
          background-color: #fef3c7;
          border-color: #f59e0b;
          color: #92400e;
        }
        
        .alert-info {
          background-color: #eff6ff;
          border-color: #3b82f6;
          color: #1e40af;
        }
        
        /* Lists */
        .email-list {
          margin: 20px 0;
          padding-left: 0;
        }
        
        .email-list li {
          list-style: none;
          padding: 8px 0;
          padding-left: 25px;
          position: relative;
          color: #4b5563;
        }
        
        .email-list li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #059669;
          font-weight: bold;
        }
        
        /* Footer */
        .email-footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 15px;
        }
        
        .footer-links {
          font-size: 12px;
          color: #9ca3af;
        }
        
        .footer-links a {
          color: #2563eb;
          text-decoration: none;
        }
        
        /* Responsive styles */
        @media only screen and (max-width: 600px) {
          .email-wrapper {
            padding: 10px !important;
          }
          
          .email-container {
            width: 100% !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          
          .email-header {
            padding: 25px 15px !important;
          }
          
          .email-header h1 {
            font-size: 24px !important;
          }
          
          .email-content {
            padding: 25px 20px !important;
          }
          
          .email-title {
            font-size: 20px !important;
            line-height: 1.2 !important;
          }
          
          .email-text {
            font-size: 15px !important;
          }
          
          .info-box {
            padding: 15px !important;
            margin: 20px 0 !important;
          }
          
          .info-box h3 {
            font-size: 16px !important;
          }
          
          .btn {
            padding: 14px 24px !important;
            font-size: 15px !important;
            min-width: 180px !important;
            display: block !important;
            width: 100% !important;
            max-width: 280px !important;
            margin: 0 auto !important;
          }
          
          .button-container {
            margin: 25px 0 !important;
          }
          
          .email-footer {
            padding: 20px 15px !important;
          }
          
          .footer-text {
            font-size: 13px !important;
          }
        }
        
        @media only screen and (max-width: 480px) {
          .email-header h1 {
            font-size: 22px !important;
          }
          
          .email-title {
            font-size: 18px !important;
          }
          
          .email-text {
            font-size: 14px !important;
          }
          
          .info-item {
            font-size: 14px !important;
          }
          
          .btn {
            padding: 12px 20px !important;
            font-size: 14px !important;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .email-container {
            background-color: #1f2937 !important;
          }
          
          .email-content {
            color: #f9fafb !important;
          }
          
          .email-title {
            color: #f9fafb !important;
          }
          
          .email-text {
            color: #d1d5db !important;
          }
          
          .info-box {
            background: linear-gradient(f, #374151 0%, #4b5563 100%) !important;
          }
          
          .email-footer {
            background-color: #111827 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <div class="email-header">
            <h1>Soko Support</h1>
            <div class="tagline">Connecting Africa to America</div>
          </div>
          ${content}
          <div class="email-footer">
            <div class="footer-text">
              Thank you for choosing Soko Platform
            </div>
            <div class="footer-links">
              <a href="${process.env.CLIENT_URL}/support">Support Center</a> | 
              <a href="${process.env.CLIENT_URL}/contact">Contact Us</a> | 
              <a href="${process.env.CLIENT_URL}/unsubscribe">Unsubscribe</a>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send mobile-responsive email when a new ticket is created
 */
const sendTicketCreatedEmail = async ({
  userEmail,
  userName,
  ticketNumber,
  subject,
  category,
}) => {
  const content = `
    <div class="email-content">
      <h2 class="email-title">Support Ticket Created</h2>
      
      <p class="email-text">
        Hi ${userName},
      </p>
      
      <p class="email-text">
        Thank you for contacting Soko Support. We have received your support request and created a ticket for you.
      </p>
      
      <div class="info-box">
        <h3>Ticket Details:</h3>
        <div class="info-item"><strong>Ticket Number:</strong> ${ticketNumber}</div>
        <div class="info-item"><strong>Subject:</strong> ${subject}</div>
        <div class="info-item"><strong>Category:</strong> ${category
          .replace('_', ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())}</div>
      </div>
      
      <p class="email-text">
        Our support team will review your request and respond as soon as possible. You can expect to hear from us within:
      </p>
      
      <ul class="email-list">
        <li><strong>Urgent issues:</strong> Within 2 hours</li>
        <li><strong>High priority:</strong> Within 4 hours</li>
        <li><strong>Medium priority:</strong> Within 8 hours</li>
        <li><strong>Low priority:</strong> Within 24 hours</li>
      </ul>
      
      <div class="button-container">
        <a href="${
          process.env.CLIENT_URL
        }/support/tickets/${ticketNumber}" class="btn">
          View Ticket
        </a>
      </div>
      
      <p class="email-text">
        You can track the status of your ticket by logging into your Soko account and visiting the Support section.
      </p>
    </div>
  `;

  const html = getBaseEmailTemplate(
    content,
    `Support Ticket Created - ${ticketNumber}`
  );

  try {
    await sendEmail({
      to: userEmail,
      subject: `Support Ticket Created - ${ticketNumber}`,
      html,
    });
    console.log(`Ticket creation email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending ticket creation email:', error);
  }
};

/**
 * Send mobile-responsive email when admin responds to a ticket
 */
const sendTicketResponseEmail = async ({
  userEmail,
  userName,
  ticketNumber,
  adminName,
  message,
}) => {
  console.log(userEmail);
  const content = `
    <div class="email-content">
      <h2 class="email-title">New Response to Your Support Ticket</h2>
      
      <p class="email-text">
        Hi ${userName},
      </p>
      
      <p class="email-text">
        ${adminName} from our support team has responded to your ticket <strong>${ticketNumber}</strong>.
      </p>
      
      <div class="info-box">
        <h3>Response from ${adminName}:</h3>
        <div style="color: #374151; line-height: 1.6; margin-top: 10px;">
          ${message.length > 200 ? message.substring(0, 200) + '...' : message}
        </div>
      </div>
      
      <div class="button-container">
        <a href="${
          process.env.CLIENT_URL
        }/support/tickets/${ticketNumber}" class="btn btn-success">
          View & Respond
        </a>
      </div>
      
      <p class="email-text">
        You can view the full conversation and respond by clicking the button above.
      </p>
    </div>
  `;

  const html = getBaseEmailTemplate(
    content,
    `Support Response - ${ticketNumber}`
  );

  try {
    await sendEmail({
      to: userEmail,
      subject: `Support Response - ${ticketNumber}`,
      html,
    });
    console.log(`Ticket response email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending ticket response email:', error);
  }
};

/**
 * Send mobile-responsive email when ticket status is updated
 */
const sendTicketStatusUpdateEmail = async ({
  userEmail,
  userName,
  ticketNumber,
  oldStatus,
  newStatus,
  subject,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return '#059669';
      case 'closed':
        return '#6b7280';
      case 'in_progress':
        return '#2563eb';
      default:
        return '#d97706';
    }
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusAlert = (status) => {
    if (status === 'resolved') {
      return `
        <div class="alert alert-success">
          <strong>🎉 Your issue has been resolved!</strong><br>
          We hope our solution was helpful. If you need further assistance, you can reopen this ticket by adding a new message.
        </div>
      `;
    } else if (status === 'closed') {
      return `
        <div class="alert alert-info">
          <strong>This ticket has been closed.</strong><br>
          If you need further assistance, please create a new support ticket.
        </div>
      `;
    }
    return '';
  };

  const content = `
    <div class="email-content">
      <h2 class="email-title">Ticket Status Updated</h2>
      
      <p class="email-text">
        Hi ${userName},
      </p>
      
      <p class="email-text">
        The status of your support ticket has been updated.
      </p>
      
      <div class="info-box">
        <h3>Ticket Information:</h3>
        <div class="info-item"><strong>Ticket Number:</strong> ${ticketNumber}</div>
        <div class="info-item"><strong>Subject:</strong> ${subject}</div>
        <div class="info-item">
          <strong>Status:</strong> 
          <span style="color: #6b7280;">${getStatusLabel(oldStatus)}</span> 
          → 
          <span style="color: ${getStatusColor(
            newStatus
          )}; font-weight: 600;">${getStatusLabel(newStatus)}</span>
        </div>
      </div>
      
      ${getStatusAlert(newStatus)}
      
      ${
        newStatus !== 'closed'
          ? `
        <div class="button-container">
          <a href="${process.env.CLIENT_URL}/support/tickets/${ticketNumber}" class="btn">
            View Ticket
          </a>
        </div>
      `
          : ''
      }
    </div>
  `;

  const html = getBaseEmailTemplate(
    content,
    `Ticket Status Update - ${ticketNumber}`
  );

  try {
    await sendEmail({
      to: userEmail,
      subject: `Ticket Status Update - ${ticketNumber}`,
      html,
    });
    console.log(`Status update email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
};

/**
 * Send email notification to admin about new high-priority ticket
 */
const sendAdminTicketNotificationEmail = async ({
  ticketNumber,
  subject,
  priority,
  category,
  userName,
  userRole,
}) => {
  const adminEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',')
    : ['abel4@ethereal.email'];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#d97706';
      default:
        return '#059669';
    }
  };

  const content = `
    <div class="email-content">
      <div class="alert alert-warning">
        <strong>🚨 Priority Support Alert</strong><br>
        A new ${priority.toUpperCase()} priority ticket requires immediate attention.
      </div>
      
      <h2 class="email-title">New ${priority.toUpperCase()} Priority Ticket</h2>
      
      <div class="info-box">
        <h3>Ticket Details:</h3>
        <div class="info-item"><strong>Ticket Number:</strong> ${ticketNumber}</div>
        <div class="info-item"><strong>Subject:</strong> ${subject}</div>
        <div class="info-item">
          <strong>Priority:</strong> 
          <span style="color: ${getPriorityColor(
            priority
          )}; font-weight: 600; text-transform: uppercase;">${priority}</span>
        </div>
        <div class="info-item"><strong>Category:</strong> ${category
          .replace('_', ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())}</div>
        <div class="info-item"><strong>Customer:</strong> ${userName} (${userRole})</div>
      </div>
      
      <div class="alert alert-warning">
        <strong>⚡ Expected Response Time:</strong> ${
          priority === 'urgent' ? '2 hours' : '4 hours'
        }
      </div>
      
      <div class="button-container">
        <a href="${
          process.env.ADMIN_URL || process.env.CLIENT_URL
        }/admin/support/tickets/${ticketNumber}" 
           class="btn btn-danger">
          Review Ticket
        </a>
      </div>
      
      <p class="email-text">
        Please assign and respond to this ticket promptly to maintain our service level agreements.
      </p>
    </div>
  `;

  const html = getBaseEmailTemplate(
    content,
    `🚨 ${priority.toUpperCase()} Priority Ticket - ${ticketNumber}`
  );

  try {
    for (const adminEmail of adminEmails) {
      await sendEmail({
        to: adminEmail.trim(),
        subject: `🚨 ${priority.toUpperCase()} Priority Ticket - ${ticketNumber}`,
        html,
      });
    }
    console.log(`Priority ticket notification sent to admin team`);
  } catch (error) {
    console.error('Error sending admin notification email:', error);
  }
};

/**
 * Send email when ticket is assigned to admin
 */
const sendTicketAssignedEmail = async ({
  adminEmail,
  adminName,
  ticketNumber,
  subject,
  priority,
  userName,
}) => {
  const content = `
    <div class="email-content">
      <h2 class="email-title">Ticket Assigned to You</h2>
      
      <p class="email-text">
        Hi ${adminName},
      </p>
      
      <p class="email-text">
        A support ticket has been assigned to you for handling.
      </p>
      
      <div class="info-box">
        <h3>Assignment Details:</h3>
        <div class="info-item"><strong>Ticket Number:</strong> ${ticketNumber}</div>
        <div class="info-item"><strong>Subject:</strong> ${subject}</div>
        <div class="info-item"><strong>Priority:</strong> ${priority.toUpperCase()}</div>
        <div class="info-item"><strong>Customer:</strong> ${userName}</div>
      </div>
      
      <div class="button-container">
        <a href="${
          process.env.ADMIN_URL || process.env.CLIENT_URL
        }/admin/support/tickets/${ticketNumber}" 
           class="btn">
          Handle Ticket
        </a>
      </div>
      
      <p class="email-text">
        Please review the ticket details and respond according to our service level agreements.
      </p>
    </div>
  `;

  const html = getBaseEmailTemplate(
    content,
    `Ticket Assigned - ${ticketNumber}`
  );

  try {
    await sendEmail({
      to: adminEmail,
      subject: `Ticket Assigned - ${ticketNumber}`,
      html,
    });
    console.log(`Assignment email sent to ${adminEmail}`);
  } catch (error) {
    console.error('Error sending assignment email:', error);
  }
};

/**
 * Send escalation notification email
 */
const sendTicketEscalationEmail = async ({
  ticketNumber,
  subject,
  oldPriority,
  newPriority,
  reason,
  userName,
  escalatedAt,
}) => {
  const adminEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',')
    : ['admin@vesoko.com'];

  const content = `
    <div class="email-content">
      <div class="alert alert-warning">
        <strong>⚠️ Ticket Escalation Alert</strong><br>
        A support ticket has been automatically escalated due to SLA breach.
      </div>
      
      <h2 class="email-title">Ticket Escalated</h2>
      
      <div class="info-box">
        <h3>Escalation Details:</h3>
        <div class="info-item"><strong>Ticket Number:</strong> ${ticketNumber}</div>
        <div class="info-item"><strong>Subject:</strong> ${subject}</div>
        <div class="info-item"><strong>Customer:</strong> ${userName}</div>
        <div class="info-item"><strong>Priority:</strong> ${oldPriority.toUpperCase()} → ${newPriority.toUpperCase()}</div>
        <div class="info-item"><strong>Reason:</strong> ${reason
          .replace('_', ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())}</div>
        <div class="info-item"><strong>Escalated At:</strong> ${new Date(
          escalatedAt
        ).toLocaleString()}</div>
      </div>
      
      <div class="button-container">
        <a href="${
          process.env.ADMIN_URL || process.env.CLIENT_URL
        }/admin/support/tickets/${ticketNumber}" 
           class="btn btn-danger">
          Review Escalated Ticket
        </a>
      </div>
    </div>
  `;

  const html = getBaseEmailTemplate(
    content,
    `Ticket Escalated - ${ticketNumber}`
  );

  try {
    for (const adminEmail of adminEmails) {
      await sendEmail({
        to: adminEmail.trim(),
        subject: `⚠️ Ticket Escalated - ${ticketNumber}`,
        html,
      });
    }
    console.log(`Escalation notification sent to admin team`);
  } catch (error) {
    console.error('Error sending escalation email:', error);
  }
};

/**
 * Send SLA breach warning email
 */
const sendSLABreachWarningEmail = async ({
  userEmail,
  userName,
  ticketNumber,
  subject,
  daysSinceLastResponse,
}) => {
  const content = `
    <div class="email-content">
      <h2 class="email-title">Action Required: Support Ticket Response</h2>
      
      <p class="email-text">
        Hi ${userName},
      </p>
      
      <div class="alert alert-warning">
        <strong>⏰ Response Needed</strong><br>
        Your support ticket has been waiting for your response for ${daysSinceLastResponse} days.
      </div>
      
      <p class="email-text">
        We're waiting for your response on ticket <strong>${ticketNumber}</strong> regarding: "${subject}"
      </p>
      
      <p class="email-text">
        If we don't hear from you within the next 7 days, this ticket will be automatically closed. 
        You can always reopen it or create a new ticket if you need further assistance.
      </p>
      
      <div class="button-container">
        <a href="${process.env.CLIENT_URL}/support/tickets/${ticketNumber}" class="btn btn-warning">
          Respond Now
        </a>
      </div>
    </div>
  `;

  const html = getBaseEmailTemplate(
    content,
    `Action Required - ${ticketNumber}`
  );

  try {
    await sendEmail({
      to: userEmail,
      subject: `Action Required: Support Ticket Response - ${ticketNumber}`,
      html,
    });
    console.log(`SLA warning email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending SLA warning email:', error);
  }
};

module.exports = {
  sendTicketCreatedEmail,
  sendTicketResponseEmail,
  sendTicketStatusUpdateEmail,
  sendAdminTicketNotificationEmail,
  sendTicketAssignedEmail,
  sendTicketEscalationEmail,
  sendSLABreachWarningEmail,
};

// /**
//  * Send email when a new ticket is created
//  */
// const sendTicketCreatedEmail = async ({
//   userEmail,
//   userName,
//   ticketNumber,
//   subject,
//   category,
// }) => {
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
//       <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//         <div style="text-align: center; margin-bottom: 30px;">
//           <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Soko Support</h1>
//         </div>

//         <h2 style="color: #333; margin-bottom: 20px;">Support Ticket Created</h2>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           Hi ${userName},
//         </p>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           Thank you for contacting Soko Support. We have received your support request and created a ticket for you.
//         </p>

//         <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
//           <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Ticket Details:</h3>
//           <p style="margin: 5px 0; color: #666;"><strong>Ticket Number:</strong> ${ticketNumber}</p>
//           <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
//           <p style="margin: 5px 0; color: #666;"><strong>Category:</strong> ${category
//             .replace('_', ' ')
//             .replace(/\b\w/g, (l) => l.toUpperCase())}</p>
//         </div>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           Our support team will review your request and respond as soon as possible. You can expect to hear from us within:
//         </p>

//         <ul style="color: #666; line-height: 1.6; margin-bottom: 20px; padding-left: 20px;">
//           <li><strong>Urgent issues:</strong> Within 2 hours</li>
//           <li><strong>High priority:</strong> Within 4 hours</li>
//           <li><strong>Medium priority:</strong> Within 8 hours</li>
//           <li><strong>Low priority:</strong> Within 24 hours</li>
//         </ul>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           You can track the status of your ticket by logging into your Soko account and visiting the Support section.
//         </p>

//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${process.env.CLIENT_URL}/support/tickets/${ticketNumber}"
//              style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
//             View Ticket
//           </a>
//         </div>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
//           Best regards,<br>
//           The Soko Support Team
//         </p>

//         <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

//         <p style="color: #999; font-size: 12px; text-align: center;">
//           This is an automated message. Please do not reply to this email.
//         </p>
//       </div>
//     </div>
//   `;

//   try {
//     await sendEmail({
//       to: userEmail,
//       subject: `Support Ticket Created - ${ticketNumber}`,
//       html,
//     });
//     console.log(`Ticket creation email sent to ${userEmail}`);
//   } catch (error) {
//     console.error('Error sending ticket creation email:', error);
//   }
// };

// /**
//  * Send email when admin responds to a ticket
//  */
// const sendTicketResponseEmail = async ({
//   userEmail,
//   userName,
//   ticketNumber,
//   adminName,
//   message,
// }) => {
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
//       <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//         <div style="text-align: center; margin-bottom: 30px;">
//           <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Soko Support</h1>
//         </div>

//         <h2 style="color: #333; margin-bottom: 20px;">New Response to Your Support Ticket</h2>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           Hi ${userName},
//         </p>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           ${adminName} from our support team has responded to your ticket: <strong>${ticketNumber}</strong>.
//         </p>

//         <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #059669;">
//           <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Response from ${adminName}:</h3>
//           <p style="margin: 0; color: #666; line-height: 1.6;">${message}</p>
//         </div>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           You can view the full conversation and respond by clicking the button below:
//         </p>

//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${process.env.CLIENT_URL}/support/tickets/${ticketNumber}"
//              style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
//             View & Respond
//           </a>
//         </div>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
//           Best regards,<br>
//           The Soko Support Team
//         </p>

//         <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

//         <p style="color: #999; font-size: 12px; text-align: center;">
//           This is an automated message. Please do not reply to this email.
//         </p>
//       </div>
//     </div>
//   `;

//   try {
//     await sendEmail({
//       to: userEmail,
//       subject: `Support Response - ${ticketNumber}`,
//       html,
//     });
//     console.log(`Ticket response email sent to ${userEmail}`);
//   } catch (error) {
//     console.error('Error sending ticket response email:', error);
//   }
// };

// /**
//  * Send email when ticket status is updated
//  */
// const sendTicketStatusUpdateEmail = async ({
//   userEmail,
//   userName,
//   ticketNumber,
//   oldStatus,
//   newStatus,
//   subject,
// }) => {
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'resolved':
//         return '#059669';
//       case 'closed':
//         return '#6b7280';
//       case 'in_progress':
//         return '#2563eb';
//       default:
//         return '#d97706';
//     }
//   };

//   const getStatusLabel = (status) => {
//     return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
//   };

//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
//       <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//         <div style="text-align: center; margin-bottom: 30px;">
//           <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Soko Support</h1>
//         </div>

//         <h2 style="color: #333; margin-bottom: 20px;">Ticket Status Updated</h2>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           Hi ${userName},
//         </p>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           The status of your support ticket has been updated.
//         </p>

//         <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${getStatusColor(
//           newStatus
//         )};">
//           <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Ticket Information:</h3>
//           <p style="margin: 5px 0; color: #666;"><strong>Ticket Number:</strong> ${ticketNumber}</p>
//           <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
//           <p style="margin: 5px 0; color: #666;">
//             <strong>Status:</strong>
//             <span style="color: #6b7280;">${getStatusLabel(oldStatus)}</span>
//             →
//             <span style="color: ${getStatusColor(
//               newStatus
//             )}; font-weight: 600;">${getStatusLabel(newStatus)}</span>
//           </p>
//         </div>

//         ${
//           newStatus === 'resolved'
//             ? `
//         <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #bbf7d0;">
//           <p style="margin: 0; color: #166534; font-weight: 500;">
//             🎉 Your issue has been resolved! We hope our solution was helpful.
//           </p>
//         </div>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           If you're satisfied with the resolution, you can rate your support experience by visiting the ticket page.
//           If you need further assistance, you can reopen this ticket by adding a new message.
//         </p>
//         `
//             : ''
//         }

//         ${
//           newStatus === 'closed'
//             ? `
//         <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #d1d5db;">
//           <p style="margin: 0; color: #374151; font-weight: 500;">
//             This ticket has been closed. If you need further assistance, please create a new support ticket.
//           </p>
//         </div>
//         `
//             : `
//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${process.env.CLIENT_URL}/support/tickets/${ticketNumber}"
//              style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
//             View Ticket
//           </a>
//         </div>
//         `
//         }

//         <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
//           Best regards,<br>
//           The Soko Support Team
//         </p>

//         <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

//         <p style="color: #999; font-size: 12px; text-align: center;">
//           This is an automated message. Please do not reply to this email.
//         </p>
//       </div>
//     </div>
//   `;

//   try {
//     await sendEmail({
//       to: userEmail,
//       subject: `Ticket Status Update - ${ticketNumber}`,
//       html,
//     });
//     console.log(`Status update email sent to ${userEmail}`);
//   } catch (error) {
//     console.error('Error sending status update email:', error);
//   }
// };

// /**
//  * Send email notification to admin about new high-priority ticket
//  */
// const sendAdminTicketNotificationEmail = async ({
//   ticketNumber,
//   subject,
//   priority,
//   category,
//   userName,
//   userRole,
// }) => {
//   const adminEmails = process.env.ADMIN_EMAILS
//     ? process.env.ADMIN_EMAILS.split(',')
//     : ['admin@vesoko.com'];

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case 'urgent':
//         return '#dc2626';
//       case 'high':
//         return '#ea580c';
//       case 'medium':
//         return '#d97706';
//       default:
//         return '#059669';
//     }
//   };

//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
//       <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//         <div style="text-align: center; margin-bottom: 30px;">
//           <h1 style="color: #dc2626; margin: 0; font-size: 24px;">🚨 Priority Support Alert</h1>
//         </div>

//         <h2 style="color: #333; margin-bottom: 20px;">New ${priority.toUpperCase()} Priority Ticket</h2>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           A new ${priority} priority support ticket has been created that requires immediate attention.
//         </p>

//         <div style="background-color: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${getPriorityColor(
//           priority
//         )};">
//           <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Ticket Details:</h3>
//           <p style="margin: 5px 0; color: #666;"><strong>Ticket Number:</strong> ${ticketNumber}</p>
//           <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
//           <p style="margin: 5px 0; color: #666;"><strong>Priority:</strong>
//             <span style="color: ${getPriorityColor(
//               priority
//             )}; font-weight: 600; text-transform: uppercase;">${priority}</span>
//           </p>
//           <p style="margin: 5px 0; color: #666;"><strong>Category:</strong> ${category
//             .replace('_', ' ')
//             .replace(/\b\w/g, (l) => l.toUpperCase())}</p>
//           <p style="margin: 5px 0; color: #666;"><strong>Customer:</strong> ${userName} (${userRole})</p>
//         </div>

//         <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #f59e0b;">
//           <p style="margin: 0; color: #92400e; font-weight: 500;">
//             ⚡ Expected Response Time: ${
//               priority === 'urgent' ? '2 hours' : '4 hours'
//             }
//           </p>
//         </div>

//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${
//             process.env.ADMIN_URL || process.env.CLIENT_URL
//           }/admin/support/tickets/${ticketNumber}"
//              style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
//             Review Ticket
//           </a>
//         </div>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
//           Please assign and respond to this ticket promptly to maintain our service level agreements.
//         </p>

//         <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

//         <p style="color: #999; font-size: 12px; text-align: center;">
//           VeSoko Support System - Automated Alert
//         </p>
//       </div>
//     </div>
//   `;

//   try {
//     for (const adminEmail of adminEmails) {
//       await sendEmail({
//         to: adminEmail.trim(),
//         subject: `🚨 ${priority.toUpperCase()} Priority Ticket - ${ticketNumber}`,
//         html,
//       });
//     }
//     console.log(`Priority ticket notification sent to admin team`);
//   } catch (error) {
//     console.error('Error sending admin notification email:', error);
//   }
// };

// /**
//  * Send email when ticket is assigned to admin
//  */
// const sendTicketAssignedEmail = async ({
//   adminEmail,
//   adminName,
//   ticketNumber,
//   subject,
//   priority,
//   userName,
// }) => {
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
//       <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//         <div style="text-align: center; margin-bottom: 30px;">
//           <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Soko Support</h1>
//         </div>

//         <h2 style="color: #333; margin-bottom: 20px;">Ticket Assigned to You</h2>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           Hi ${adminName},
//         </p>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//           A support ticket has been assigned to you for handling.
//         </p>

//         <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
//           <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Assignment Details:</h3>
//           <p style="margin: 5px 0; color: #666;"><strong>Ticket Number:</strong> ${ticketNumber}</p>
//           <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
//           <p style="margin: 5px 0; color: #666;"><strong>Priority:</strong> ${priority.toUpperCase()}</p>
//           <p style="margin: 5px 0; color: #666;"><strong>Customer:</strong> ${userName}</p>
//         </div>

//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${
//             process.env.ADMIN_URL || process.env.CLIENT_URL
//           }/admin/support/tickets/${ticketNumber}"
//              style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
//             Handle Ticket
//           </a>
//         </div>

//         <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
//           Please review the ticket details and respond according to our service level agreements.
//         </p>

//         <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

//         <p style="color: #999; font-size: 12px; text-align: center;">
//           Soko Support System
//         </p>
//       </div>
//     </div>
//   `;

//   try {
//     await sendEmail({
//       to: adminEmail,
//       subject: `Ticket Assigned - ${ticketNumber}`,
//       html,
//     });
//     console.log(`Assignment email sent to ${adminEmail}`);
//   } catch (error) {
//     console.error('Error sending assignment email:', error);
//   }
// };

// module.exports = {
//   sendTicketCreatedEmail,
//   sendTicketResponseEmail,
//   sendTicketStatusUpdateEmail,
//   sendAdminTicketNotificationEmail,
//   sendTicketAssignedEmail,
// };
