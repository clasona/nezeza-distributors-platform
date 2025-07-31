import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { backendLogin } from '@/utils/auth/backendLogin';

// Declare the Session interface to define the shape of the session object.
// TypeScript will use this interface implicitly for type checking.
declare module 'next-auth' {
  interface Session {
    user: {
      _id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      image?: string;
      storeId?: {
        _id: string;
        name: string;
        email: string;
        storeType: string;
      };
    };
  }
}

const authOptions = {
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'Enter your email',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Enter your password',
        },
      },
      async authorize(credentials, req) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          try {
            // Use the backend login endpoint to authenticate and get cookies
            const response = await backendLogin(email, password);
            
            if (response && response.success && response.user) {
              // The backendLogin function should have set the JWT cookies via the backend
              // Remove sensitive information before returning
              const user = response.user;
              const { previousPasswords, password: _, ...userWithoutPasswords } = user;
              return userWithoutPasswords;
            }
          } catch (error) {
            console.log('Login failed:', error);
            return null;
          }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        // token.user = user;
        token.user = {
          ...token.user,
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          storeId: user.storeId,
        };
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && token.user) {
        // session.user = token.user;
        session.user = {
          ...session.user,
          _id: token.user._id,
          firstName: token.user.firstName,
          lastName: token.user.lastName,
          storeId: token.user.storeId,
        };

        // console.log('sesss', session);
      }
      return session;
    },
  },
  events: {
    async signOut() {
      // This will be called when NextAuth signs out
      // The backend logout will be handled by the LogoutButton component
      console.log('NextAuth signOut event triggered');
    },
  },
};

// Export the NextAuth handler as GET and POST
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

export default NextAuth(authOptions);
