import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Forward cookies from the request to the backend
    const cookies = req.headers.cookie;
    
    console.log('Received cookies:', cookies);
    
    if (!cookies) {
      return res.status(200).json({
        authenticated: false,
        message: 'No cookies found in request',
      });
    }

    // Test if the user is authenticated by calling a protected endpoint
    const response = await axios.get(`${BACKEND_URL}/api/v1/support/my-tickets`, {
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    return res.status(200).json({
      authenticated: true,
      message: 'User is authenticated',
      tickets: response.data.tickets?.length || 0,
    });

  } catch (error: any) {
    console.error('Auth test error:', error.response?.data || error.message);
    
    return res.status(200).json({
      authenticated: false,
      message: error.response?.data?.message || error.response?.data?.msg || 'Authentication failed',
      status: error.response?.status,
    });
  }
}
