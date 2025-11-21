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
          name: user.name ?? undefined,
          role: user.role, // This is correct
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
        const id = (user as any).id ?? token.id;
        const role = (user as any).role ?? token.role;
        return { ...token, id, role };
      }
      return token;
    },

    session: ({ session, token }) => {
      if (token) {
        const user = {
          ...(session.user ?? {}),
          id: token.id as string,
          role: token.role as string,
        };
        return { ...session, user };
      }
      return session;
    },

    async signIn({ user }) {
      const email = user?.email?.toLowerCase() ?? '';
      if (email === 'admin@foo.com' || email === 'john@foo.com') return true;
      if (!email.endsWith('@hawaii.edu')) return '/?uh_error=1';
      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return url;
      return `${baseUrl}/user-home`;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
