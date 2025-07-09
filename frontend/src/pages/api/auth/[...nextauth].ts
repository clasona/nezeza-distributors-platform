import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
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

          const { email, password } = parsedCredentials.data;
          const response = await getUserByEmail(email);

          if (!response || !response.data.user) {
            console.log('User not found');
            return null;
          }

          const user = response.data.user;

          // Check if the user has a previousPasswords array and get the first one
          if (user.previousPasswords && user.previousPasswords.length > 0) {
            const storedHashedPassword = user.previousPasswords[0];
            const passwordsMatch = await bcrypt.compare(
              password,
              storedHashedPassword
            );

            if (passwordsMatch) {
              // Remove sensitive information before returning
              const { previousPasswords, ...userWithoutPasswords } = user;
              return {
                ...userWithoutPasswords,
                provider: 'credentials',
              };
            }
          } else {
            console.log('No previous passwords found for user');
            return null;
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

    // async jwt({ token, user, account, profile }: any) {
    //   if (user && account) {
    //     // For first-time login with credentials provider
    //     if (account.provider === 'credentials') {
    //       token.user = {
    //         _id: user._id,
    //         firstName: user.firstName,
    //         lastName: user.lastName,
    //         email: user.email,
    //         image: user.image,
    //         storeId: user.storeId,
    //         provider: 'credentials',
    //       };
    //     }
    //     // For first-time login with Google OAuth
    //     else if (account.provider === 'google') {
    //       try {
    //         // Always fetch the actual user data from database for Google OAuth
    //         const response = await getUserByEmail(user.email);
    //         if (response?.data?.user) {
    //           const dbUser = response.data.user;
    //           token.user = {
    //             _id: dbUser._id, // Use database _id, not Google ID
    //             firstName: dbUser.firstName,
    //             lastName: dbUser.lastName,
    //             email: dbUser.email,
    //             image: user.image || profile?.picture,
    //             storeId: dbUser.storeId, // This is crucial for your redirect logic
    //             provider: 'google',
    //           };
    //         } else {
    //           // Fallback if database user not found
    //           token.user = {
    //             _id: user.id, // Google ID as fallback
    //             firstName: profile?.given_name || user.name?.split(' ')[0],
    //             lastName:
    //               profile?.family_name ||
    //               user.name?.split(' ').slice(1).join(' '),
    //             email: user.email,
    //             image: user.image || profile?.picture,
    //             storeId: null,
    //             provider: 'google',
    //           };
    //         }
    //       } catch (error) {
    //         console.error('Error fetching user data in JWT callback:', error);
    //         // Fallback user object
    //         token.user = {
    //           _id: user.id,
    //           firstName: profile?.given_name || user.name?.split(' ')[0],
    //           lastName:
    //             profile?.family_name ||
    //             user.name?.split(' ').slice(1).join(' '),
    //           email: user.email,
    //           image: user.image || profile?.picture,
    //           storeId: null,
    //           provider: 'google',
    //         };
    //       }
    //     }
    //   }
    //   // For subsequent requests, token.user already exists
    //   else if (token.user && !user && !account) {
    //     // Token refresh - optionally refetch user data to ensure it's up to date
    //     // console.log('Token refresh - existing user data:', token.user);
    //   }

    //   // console.log('JWT token after processing:', token);
    //   return token;
    // },

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
};

export default NextAuth(authOptions);
