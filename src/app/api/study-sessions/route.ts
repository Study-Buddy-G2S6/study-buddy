// src/app/api/study-sessions/route.ts
import { NextResponse } from 'next/server';
import { getServerSession, DefaultSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
    } & DefaultSession['user'];
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // If no session or no user.id → not logged in
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    if (Number.isNaN(userId)) {
      console.error('study-sessions GET: session.user.id is not a number', session.user.id);
      return NextResponse.json({ error: 'Invalid session user id' }, { status: 500 });
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId, // your User.id is Int
      },
      orderBy: { startDate: 'asc' },
      include: { course: true, user: true },
    });

    // Return raw sessions (with included relations) for easier local debugging.
    console.debug('study-sessions GET returning sessions count:', sessions.length);
    return NextResponse.json(sessions);
  } catch (err: any) {
    console.error('study-sessions GET error:', err);
    return NextResponse.json({ error: 'Server error', details: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number(session.user.id);
  if (Number.isNaN(userId)) {
    console.error('study-sessions POST: session.user.id is not a number', session.user.id);
    return NextResponse.json({ error: 'Invalid session user id' }, { status: 500 });
  }

  const body = await request.json();
  const { title, course, location, description, startDate, endDate } = body;

  if (!title || !course || !startDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const newSession = await prisma.session.create({
      data: {
        name: title.trim(),
        courseId: Number(course.id),
        location: location || null,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId,
        owner: session.user.email!,
      },
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (error: any) {
    console.error('Session create error:', error);
    return NextResponse.json({ error: 'Failed to save session', details: error.message }, { status: 500 });
  }
}
