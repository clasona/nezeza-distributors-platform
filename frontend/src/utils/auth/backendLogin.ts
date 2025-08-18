import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const backendLogin = async (email: string, password: string) => {
  try {
    // Make direct request to backend from server-side (NextAuth authorize function)
    const response = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, {
      email,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return {
      success: true,
      user: response.data.user,
    };
  } catch (error: any) {
    console.error('Backend login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.response?.data?.msg || 'Login failed');
  }
};
