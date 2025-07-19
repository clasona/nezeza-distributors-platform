import axios from 'axios';

export const getTicketByNumber = async (ticketNumber: string) => {
  const res = await axios.get(`/api/v1/support/lookup/${ticketNumber}`);
  return res.data;
};
