import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line import/prefer-default-export
export async function GET() {
  try {
    const courses = await prisma.course.findMany({ select: { id: true, courseName: true, courseTitle: true } });
    return NextResponse.json(courses);
  } catch (err) {
    console.error('api/courses error', err);
    return NextResponse.json([], { status: 500 });
  }
}
