import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userIdParam = searchParams.get('userId');
    if (!userIdParam) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const userId = parseInt(userIdParam, 10);
    if (Number.isNaN(userId)) return NextResponse.json({ error: 'invalid userId' }, { status: 400 });

    const enrollments = await prisma.courseToUser.findMany({
      where: { userId },
      include: { course: true },
    });

    const courses = enrollments.map((e) => e.course);
    return NextResponse.json(courses);
  } catch (err) {
    console.error('user-courses: failed to fetch enrolled courses', err);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

export default GET;
