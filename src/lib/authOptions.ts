// src/lib/authOptions.ts
import { compare } from 'bcrypt';
import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },

  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
  },

  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: (user as any).id,
          role: (user as any).role,
        };
      }
      return token;
    },

    session: ({ session, token }) => {
      if (token && session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: (token as any).id,
            role: (token as any).role,
          },
        };
      }
      return session;
    },

    // ← THIS ALLOWS TEST ACCOUNTS (delete the block when you go live)
    async signIn({ user }) {
      const email = user?.email?.toLowerCase() ?? '';
      if (email === 'admin@foo.com' || email === 'john@foo.com') return true;
      if (!email.endsWith('@hawaii.edu')) return '/?uh_error=1';
      return true;
    },

    // ← THIS FIXES THE "CAN'T LOG IN" BUG
    async redirect({ url, baseUrl }) {
      // After successful login → go straight to user-home
      if (url.startsWith('/')) return url;
      return `${baseUrl}/user-home`;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
