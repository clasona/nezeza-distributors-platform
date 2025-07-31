import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Make request to backend login endpoint
    const response = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, {
      email,
      password,
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Extract cookies from backend response
    const setCookieHeaders = response.headers['set-cookie'];
    
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      // Forward all cookies to the client
      res.setHeader('Set-Cookie', setCookieHeaders);
      console.log('Set cookies from backend:', setCookieHeaders);
    } else {
      console.log('No cookies received from backend');
    }

    // Return user data
    return res.status(200).json({
      success: true,
      user: response.data.user,
    });

  } catch (error: any) {
    console.error('Backend login error:', error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Login failed',
    });
  }
}
