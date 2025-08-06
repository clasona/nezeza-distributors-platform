import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import NextAuth from 'next-auth';

// Import your NextAuth config
const authOptions = {
  // Copy your authOptions from [...nextauth].ts here
  // Or import them if they're exported
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the session from NextAuth
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Make a request to your backend login endpoint
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    let loginResponse;
    
    // Check if user signed in with Google or credentials
    if (session.user.provider === 'google') {
      loginResponse = await fetch(`${backendUrl}/api/v1/auth/login/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      });
    } else {
      // For credentials login, we can't send the password again
      // So we'll use a special endpoint or modify the backend to accept session-based login
      return res.status(400).json({ 
        message: 'Backend login bridge not available for credentials login' 
      });
    }

    if (!loginResponse.ok) {
      const errorData = await loginResponse.text();
      console.error('Backend login failed:', errorData);
      return res.status(500).json({ message: 'Backend login failed' });
    }

    // Get the cookies from the backend response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    
    if (setCookieHeader) {
      // Forward the cookies to the client
      res.setHeader('Set-Cookie', setCookieHeader);
    }

    const backendData = await loginResponse.json();
    
    return res.status(200).json({ 
      message: 'Backend login successful',
      user: backendData.user 
    });

  } catch (error) {
    console.error('Backend login bridge error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
