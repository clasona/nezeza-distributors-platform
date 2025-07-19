import axios from 'axios';

export const createSupportTicket = async (form: any) => {
  const res = await axios.post('/api/v1/support', form);
  return res.data;
};
