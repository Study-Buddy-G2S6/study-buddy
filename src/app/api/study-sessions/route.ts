// src/app/api/study-sessions/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  // If no session or no user.id → not logged in
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const studySessions = await prisma.studySession.findMany({
    where: {
      userId: Number(session.user.id), // your User.id is Int
    },
    orderBy: { start: 'asc' },
  });

  const events = studySessions.map((s) => ({
    id: s.id.toString(),
    title: `${s.course} - ${s.title}`,
    start: s.start.toISOString(),
    end: s.end ? s.end.toISOString() : undefined,
    extendedProps: {
      course: s.course,
      location: s.location ?? '',
      notes: s.notes ?? '',
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
  const { title, course, location, notes, start, end } = body;

  if (!title || !course || !start) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const newSession = await prisma.studySession.create({
      data: {
        title: title.trim(),
        course: course.trim(),
        location: location?.trim() || null,
        notes: notes?.trim() || null,
        start: new Date(start),
        end: end ? new Date(end) : null,
        userId: Number(session.user.id),
      },
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (error: any) {
    console.error('StudySession create error:', error);
    return NextResponse.json({ error: 'Failed to save session', details: error.message }, { status: 500 });
  }
}
