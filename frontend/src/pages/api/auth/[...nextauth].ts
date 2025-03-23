// // pages/api/auth/[...nextauth].ts
// import NextAuth from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import { JWT } from 'next-auth/jwt';

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       // Your credentials configuration
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         // Your authentication logic here
//         // If authentication succeeds, return user object with role
//         return {
//           id: 'user-id',
//           email: credentials?.email,
//           name: 'User Name',
//           role: 'manufacturer', // Include the role here
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     // This callback is called whenever a JWT is created or updated
//     async jwt({ token, user }: { token: JWT; user: any }) {
//       // If user exists in this callback, it means we're signing in
//       if (user) {
//         // Add user data to the token
//         token.role = user.role;
//         token.id = user.id;
//         // Add any other custom fields you need
//       }
//       return token;
//     },
//     // This callback is used whenever a session is checked
//     async session({ session, token }: { session: any; token: JWT }) {
//       // Add token info to the session
//       session.user.role = token.role;
//       session.user.id = token.id;
//       // Add any other custom fields
//       return session;
//     },
//   },
//   pages: {
//     signIn: '/login', // Custom sign in page
//     error: '/auth/error', // Error page
//   },
//   // This is crucial - without it, the JWT won't be saved
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   secret: process.env.NEXTAUTH_SECRET, // Make sure this is set in your .env
// };

// export default NextAuth(authOptions);

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { getStore } from '@/utils/store/getStore';
import { getUserByEmail } from '@/utils/user/getUserByEmail';

export const authOptions = {
  providers: [
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
      async profile(profile) {
        let role = 'user'; // Default role

        try {
          const user = await getUserByEmail(profile.email);
          if (user && user.storeId) {
            const storeData = await getStore(user.storeId);
            if (!storeData) {
              role = 'customer';
            }
            if (storeData && storeData.storeType) {
              if (storeData.storeType === 'manufacturer') {
                role = 'manufacturer';
              } else if (storeData.storeType === 'wholesaler') {
                role = 'wholesaler';
              } else if (storeData.storeType === 'retailer') {
                role = 'retailer';
              }
            } else {
              console.error('Error fetching store data or storeType not found');
            }
          }
        } catch (error) {
          console.error('Error fetching user or store data:', error);
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: role,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
