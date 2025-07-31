import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Forward the cookies from the request to the backend
    const cookies = req.headers.cookie;
    
    if (cookies) {
      // Try to call backend logout endpoint
      try {
        await axios.delete(`${BACKEND_URL}/api/v1/auth/logout`, {
          headers: {
            Cookie: cookies,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
      } catch (backendError) {
        // If backend logout fails, we'll still clear the frontend cookies
        console.log('Backend logout failed (this is okay):', backendError.response?.data || backendError.message);
      }
    }

    // Clear the authentication cookies on the frontend
    res.setHeader('Set-Cookie', [
      'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
    ]);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error: any) {
    console.error('Logout error:', error.response?.data || error.message);
    
    // Even if there's an error, clear the cookies
    res.setHeader('Set-Cookie', [
      'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
    ]);
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully (with cleanup)',
    });
  }
}
