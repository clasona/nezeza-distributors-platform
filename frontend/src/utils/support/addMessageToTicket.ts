import axios from 'axios';

export const addMessageToTicket = async (ticketId: string, message: string) => {
  const res = await axios.post(`/api/v1/support/tickets/${ticketId}/message`, {
    message,
  });
  return res.data;
};
