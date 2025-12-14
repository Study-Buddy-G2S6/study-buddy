import NextAuth from 'next-auth';
import authOptions from '@/lib/authOptions';

// Force Node runtime so Prisma works on Vercel (Edge does not support Prisma Client)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
