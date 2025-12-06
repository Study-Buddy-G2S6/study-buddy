// src/app/api/study-sessions/route.ts
import { NextResponse } from 'next/server';
import { getServerSession, DefaultSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  // If no session or no user.id → not logged in
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessions = await prisma.session.findMany({
    where: {
      userId: Number(session.user.id), // your User.id is Int
    },
    orderBy: { startDate: 'asc' },
  });

  const events = sessions.map((s) => ({
    id: s.id.toString(),
    name: s.name,
    startDate: s.startDate.toISOString(),
    endDate: s.endDate.toISOString(),
    extendedProps: {
      courseId: s.courseId,
      location: s.location ?? '',
      description: s.description ?? '',
    },
  }));

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        courseId: Number(course),
        location: location?.trim() || null,
        description: description?.trim() || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId: Number(session.user.id),
        owner: session.user.email!,
      },
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (error: any) {
    console.error('StudySession create error:', error);
    return NextResponse.json({ error: 'Failed to save session', details: error.message }, { status: 500 });
  }
}
