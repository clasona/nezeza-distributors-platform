import axios from 'axios';

export const getSupportMetadata = async () => {
  const res = await axios.get('/api/v1/support/metadata');
  return res.data.metadata;
};
