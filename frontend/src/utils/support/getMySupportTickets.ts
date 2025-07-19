import axios from 'axios';

export const getMySupportTickets = async () => {
  const res = await axios.get('/api/v1/support/my-tickets?limit=20&offset=0');
  return res.data;
};
