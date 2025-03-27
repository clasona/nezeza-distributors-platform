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
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/utils/user/getUserByEmail';
import { loginUser } from '@/utils/auth/loginUser';

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
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const response = await getUserByEmail(email);
          // const response = await loginUser(
          //   email,
          //   password
          // );

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
              return userWithoutPasswords;
            }
          } else {
            console.log('No previous passwords found for user');
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
        // Add any additional user info to the token
        // token.firstName = user.firstName;
        // token.email = user.email;
        // token.userType = user.storeId.storeType;
        token.user = user;
        // console.log('tokkk', token)
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        // session.user.name = token.firstName as string;
        // session.user.email = token.email as string;
        // session.user.userType = token.userType as string;
        session.user = token.user;
        // console.log('sesss', session);
      }
      return session;
    },
  },
};

// Export the NextAuth handler as GET and POST
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

export default NextAuth(authOptions);
