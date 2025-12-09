import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const name = url.searchParams.get('name');
    if (!name) {
      return NextResponse.json({ error: 'Missing course name' }, { status: 400 });
    }

    // Try to find an existing course by name (courseName is not unique in schema,
    // so use findFirst). If not found, create one.
    let course = await prisma.course.findFirst({ where: { courseName: name } });
    if (!course) {
      course = await prisma.course.create({ data: { courseName: name, courseTitle: name } });
    }

    return NextResponse.json({ id: course.id, courseName: course.courseName, courseTitle: course.courseTitle });
  } catch (err) {
    console.error('courses/lookup error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export default GET;
