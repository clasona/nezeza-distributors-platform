import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/utils/user/getUserByEmail';

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
};

// Export the NextAuth handler as GET and POST
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

export default NextAuth(authOptions);
