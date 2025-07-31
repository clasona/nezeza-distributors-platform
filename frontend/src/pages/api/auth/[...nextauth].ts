import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getUserForAuth } from '@/utils/user/getUserForAuth';
import { getUserByEmail } from '@/utils/user/getUserByEmail';
import { registerUserGoogle } from '@/utils/auth/registerUser';

// Declare the Session interface to define the shape of the session object.
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
      provider?: string;
    };
  }

  interface User {
    _id?: string;
    firstName?: string;
    lastName?: string;
    storeId?: {
      _id: string;
      name: string;
      email: string;
      storeType: string;
    };
    provider?: string;
  }
}

const authOptions = {
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on auth errors
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
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
<<<<<<< HEAD
      async authorize(credentials) {
        try {
          const parsedCredentials = z
            .object({
              email: z.string().email(),
              password: z.string().min(6),
            })
            .safeParse(credentials);

          if (!parsedCredentials.success) {
            console.log('Invalid credentials format');
            return null;
          }
=======
      async authorize(credentials, req) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);
>>>>>>> 04f1f60 (changes to the customer frontend)

          const { email, password } = parsedCredentials.data;
<<<<<<< HEAD
          const response = await getUserForAuth(email);

          if (!response || !response.data?.data?.user) {
            console.log('User not found');
            return null;
          }

          const user = response.data.data.user;

          let passwordsMatch = false;
          
          // First, check if user has a current password (most recent)
          if (user.password) {
            passwordsMatch = await bcrypt.compare(password, user.password);
          }
          
          // If current password doesn't match, check previous passwords as fallback
          if (!passwordsMatch && user.previousPasswords && user.previousPasswords.length > 0) {
            for (let i = 0; i < user.previousPasswords.length; i++) {
              const storedHashedPassword = user.previousPasswords[i];
              const prevMatch = await bcrypt.compare(password, storedHashedPassword);
              if (prevMatch) {
                passwordsMatch = true;
                break;
              }
            }
=======
          
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
>>>>>>> 04f1f60 (changes to the customer frontend)
          }

          if (passwordsMatch) {
            // Remove sensitive information before returning
            const { password: _, previousPasswords, ...userWithoutPasswords } = user;
            return {
              ...userWithoutPasswords,
              provider: 'credentials',
            };
          }

          console.log('Password does not match');
          return null;
        } catch (error) {
          console.error('Error in credentials authorization:', error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // console.log('SignIn callback - Provider:', account?.provider);
      // console.log('SignIn callback - User:', user);

      if (account?.provider === 'google') {
        try {
          console.log('Processing Google sign-in for:', user.email);

          let existingUser = null;

          try {
            const response = await getUserByEmail(user.email);
            existingUser = response?.data?.user || null;
            console.log('Existing user found:', !!existingUser);
          } catch (err: any) {
            console.log('User not found in database, will create new user');
            existingUser = null;
          }

          if (!existingUser) {
            console.log('Creating new user for Google sign-in');

            const userData: any = {
              email: user.email,
              firstName: profile?.given_name || user.name?.split(' ')[0] || '',
              lastName:
                profile?.family_name ||
                user.name?.split(' ').slice(1).join(' ') ||
                '',
              image: user.image || profile?.picture || '',
              password: '', // No password for OAuth users
            };

            // console.log('Registering new Google user:', userData);
            await registerUserGoogle(userData);
            console.log('Successfully created new user');
          }

          return true; // Allow sign in
        } catch (err) {
          console.error('Error in Google signIn callback:', err);
          return false; // Block sign in on error
        }
      }

      // For credentials provider
      if (account?.provider === 'credentials') {
        return !!user; // Allow sign in if user exists
      }

      return true; // For other providers
    },

    async jwt({ token, user, account, profile }:any) {
      // Only fetch from DB on first sign-in!
      if (user && account) {
        if (account.provider === 'google') {
          try {
            const response = await getUserByEmail(user.email);
            if (response?.data?.user) {
              const dbUser = response.data.user;
              token.user = {
                _id: dbUser._id,
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
                email: dbUser.email,
                image: user.image || profile?.picture,
                storeId: dbUser.storeId,
                provider: 'google',
              };
            } else {
              token.user = {
                _id: user.id,
                firstName: profile?.given_name || user.name?.split(' ')[0],
                lastName:
                  profile?.family_name ||
                  user.name?.split(' ').slice(1).join(' '),
                email: user.email,
                image: user.image || profile?.picture,
                storeId: null,
                provider: 'google',
              };
            }
          } catch (error) {
            token.user = {
              _id: user.id,
              firstName: profile?.given_name || user.name?.split(' ')[0],
              lastName:
                profile?.family_name ||
                user.name?.split(' ').slice(1).join(' '),
              email: user.email,
              image: user.image || profile?.picture,
              storeId: null,
              provider: 'google',
            };
          }
        } else if (account.provider === 'credentials') {
          token.user = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            image: user.image,
            storeId: user.storeId,
            provider: 'credentials',
          };
        }
      }
      // On subsequent requests, just use token.user
      return token;
    },
    async session({ session, token }: any) {
      // console.log('Session callback - Token:', token);

      if (token?.user) {
        session.user = {
          ...session.user,
          _id: token.user._id,
          firstName: token.user.firstName,
          lastName: token.user.lastName,
          email: token.user.email,
          image: token.user.image,
          storeId: token.user.storeId,
          provider: token.user.provider,
        };
      }

      // console.log('Final session:', session);
      return session;
    },
  },
<<<<<<< HEAD

  // Session configuration
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Events for debugging
  events: {
    async signIn({ user, account, profile }: any) {
      console.log('Sign in event:', {
        user: user.email,
        provider: account?.provider,
      });
    },
    async signOut({ token }: any) {
      console.log('Sign out event:', { user: token?.user?.email });
    },
    async session({ session, token }: any) {
      console.log('Session event:', { user: session.user?.email });
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',

  // Add secret for production deployments
  secret: process.env.NEXTAUTH_SECRET,
=======
  events: {
    async signOut() {
      // This will be called when NextAuth signs out
      // The backend logout will be handled by the LogoutButton component
      console.log('NextAuth signOut event triggered');
    },
  },
>>>>>>> 04f1f60 (changes to the customer frontend)
};

export default NextAuth(authOptions);
