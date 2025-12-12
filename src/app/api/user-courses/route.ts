import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userIdParam = searchParams.get('userId');
    const emailParam = searchParams.get('email');

    // If email is provided, return the user ID
    if (emailParam) {
      const user = await prisma.user.findUnique({
        where: { email: emailParam },
      });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      return NextResponse.json({ userId: user.id });
    }

    // Otherwise, fetch courses by userId
    if (!userIdParam) return NextResponse.json({ error: 'userId or email required' }, { status: 400 });

    const userId = parseInt(userIdParam, 10);
    if (Number.isNaN(userId)) return NextResponse.json({ error: 'invalid userId' }, { status: 400 });

    const enrollments = await prisma.courseToUser.findMany({
      where: { userId },
      include: { course: true },
    });

    const courses = enrollments.map((e) => e.course);
    return NextResponse.json(courses);
  } catch (err) {
    console.error('user-courses: Failed to fetch enrolled courses', err);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

export default GET;
