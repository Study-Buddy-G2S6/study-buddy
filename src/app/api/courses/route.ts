import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({ select: { id: true, courseName: true, courseTitle: true } });
    return NextResponse.json(courses);
  } catch (err) {
    console.error('api/courses error', err);
    return NextResponse.json([], { status: 500 });
  }
}

export default GET;
