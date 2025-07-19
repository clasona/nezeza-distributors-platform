import axios from 'axios';

export const getSingleTicket = async (ticketId: string) => {
  const res = await axios.get(`/api/v1/support/tickets/${ticketId}`);
  return res.data;
};
