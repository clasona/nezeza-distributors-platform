/**
 * Utility functions for handling attachments in support tickets
 */

/**
 * Calculate total attachment count including message attachments
 * @param ticket - The support ticket object
 * @returns Total number of attachments across the ticket and all its messages
 */
export const getTotalAttachmentCount = (ticket: any): number => {
  const initialAttachments = ticket.attachments ? ticket.attachments.length : 0;
  const messageAttachments = ticket.messages ? 
    ticket.messages.reduce((count: number, message: any) => {
      return count + (message.attachments ? message.attachments.length : 0);
    }, 0) : 0;
  
  return initialAttachments + messageAttachments;
};

/**
 * Get breakdown of attachment counts for display purposes
 * @param ticket - The support ticket object
 * @returns Object with initial, message, and total attachment counts
 */
export const getAttachmentBreakdown = (ticket: any): {
  initial: number;
  message: number;
  total: number;
} => {
  const initial = ticket.attachments ? ticket.attachments.length : 0;
  const message = ticket.messages ? 
    ticket.messages.reduce((count: number, msg: any) => {
      return count + (msg.attachments ? msg.attachments.length : 0);
    }, 0) : 0;
  
  return {
    initial,
    message,
    total: initial + message
  };
};

/**
 * Get all attachments from a ticket (initial + message attachments)
 * @param ticket - The support ticket object
 * @returns Array of all attachment objects
 */
export const getAllTicketAttachments = (ticket: any): any[] => {
  const allAttachments: any[] = [];
  
  // Add initial ticket attachments
  if (ticket.attachments && ticket.attachments.length > 0) {
    ticket.attachments.forEach((attachment: any) => {
      allAttachments.push({
        ...attachment,
        source: 'initial',
        messageId: null
      });
    });
  }
  
  // Add message attachments
  if (ticket.messages && ticket.messages.length > 0) {
    ticket.messages.forEach((message: any) => {
      if (message.attachments && message.attachments.length > 0) {
        message.attachments.forEach((attachment: any) => {
          allAttachments.push({
            ...attachment,
            source: 'message',
            messageId: message._id || message.id,
            messageAuthor: message.senderId || message.author
          });
        });
      }
    });
  }
  
  return allAttachments;
};

/**
 * Format attachment count with tooltip text
 * @param ticket - The support ticket object
 * @returns Object with count and tooltip text
 */
export const formatAttachmentCountDisplay = (ticket: any): {
  count: number;
  tooltip: string;
} => {
  const breakdown = getAttachmentBreakdown(ticket);
  
  let tooltip = '';
  if (breakdown.initial > 0 && breakdown.message > 0) {
    tooltip = `${breakdown.initial} initial + ${breakdown.message} from replies`;
  } else if (breakdown.initial > 0) {
    tooltip = `${breakdown.initial} initial attachment${breakdown.initial > 1 ? 's' : ''}`;
  } else if (breakdown.message > 0) {
    tooltip = `${breakdown.message} from replies`;
  } else {
    tooltip = 'No attachments';
  }
  
  return {
    count: breakdown.total,
    tooltip
  };
};
