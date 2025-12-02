'use server';

import { Stuff, Condition } from '@prisma/client';
import { hash } from 'bcrypt';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

/**
 * Adds a new stuff to the database.
 * @param stuff, an object with the following properties: name, quantity, owner, condition.
 */
export async function addStuff(stuff: { name: string; quantity: number; owner: string; condition: string }) {
  // console.log(`addStuff data: ${JSON.stringify(stuff, null, 2)}`);
  let condition: Condition = 'good';
  if (stuff.condition === 'poor') {
    condition = 'poor';
  } else if (stuff.condition === 'excellent') {
    condition = 'excellent';
  } else {
    condition = 'fair';
  }
  await prisma.stuff.create({
    data: {
      name: stuff.name,
      quantity: stuff.quantity,
      owner: stuff.owner,
      condition,
    },
  });
  // After adding, redirect to the list page
  redirect('/list');
}

/**
 * Edits an existing stuff in the database.
 * @param stuff, an object with the following properties: id, name, quantity, owner, condition.
 */
export async function editStuff(stuff: Stuff) {
  // console.log(`editStuff data: ${JSON.stringify(stuff, null, 2)}`);
  await prisma.stuff.update({
    where: { id: stuff.id },
    data: {
      name: stuff.name,
      quantity: stuff.quantity,
      owner: stuff.owner,
      condition: stuff.condition,
    },
  });
  // After updating, redirect to the list page
  redirect('/list');
}

/**
 * Deletes an existing stuff from the database.
 * @param id, the id of the stuff to delete.
 */
export async function deleteStuff(id: number) {
  // console.log(`deleteStuff id: ${id}`);
  await prisma.stuff.delete({
    where: { id },
  });
  // After deleting, redirect to the list page
  redirect('/list');
}

/**
 * Creates a new user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function createUser(credentials: {
  email: string;
  password: string;
  userName: string;
  description: string;
  profileImage: string;
  // Accept a flexible courses payload: existing Course objects (with id),
  // an array of courseName strings, or objects with courseName/courseTitle.
  courses?: Array<{ id?: number; courseName?: string; courseTitle?: string } | string>;
}) {
  // console.log(`createUser data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);

  const providedCourses = credentials.courses ?? [];

  // Determine how to attach courses using the join model `CourseToUser`.
  // Build a nested `courseToUsers` payload for prisma.user.create.
  let courseToUsersPayload: any;
  if (providedCourses.length > 0) {
    const first = providedCourses[0] as any;
    if (typeof first === 'object' && first !== null && 'id' in first && first.id) {
      // connect existing course records by id via CourseToUser entries
      courseToUsersPayload = {
        create: (providedCourses as any[]).map((c) => ({ course: { connect: { id: c.id } } })),
      };
    } else if (typeof first === 'string') {
      // array of courseName strings -> create Course records and CourseToUser entries
      courseToUsersPayload = {
        create: (providedCourses as string[]).map((name) => ({
          course: { create: { courseName: name, courseTitle: name } } })),
      };
    } else {
      // array of objects with courseName/courseTitle -> create Course and CourseToUser entries
      courseToUsersPayload = {
        create: (providedCourses as any[]).map((c) => ({
          course: { create: { courseName: c.courseName, courseTitle: c.courseTitle ?? c.courseName } } })),
      };
    }
  }

  await prisma.user.create({
    data: {
      email: credentials.email,
      password,
      userName: credentials.userName ?? credentials.email,
      description: credentials.description,
      profileImage: credentials.profileImage,
      ...(courseToUsersPayload ? { courseToUsers: courseToUsersPayload } : {}),
    },
  });
}

/**
 * Changes the password of an existing user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function changePassword(credentials: { email: string; password: string }) {
  // console.log(`changePassword data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);
  await prisma.user.update({
    where: { email: credentials.email },
    data: {
      password,
    },
  });
}

/**
 * Creates a new study session in the database.
 * @param session, an object with the following properties: name, description, startDate, endDate, courseName, owner.
 */
export async function createSession(session: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  courseName: string;
  owner: string;
}) {
  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email: session.owner },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Find or create the course
  let course = await prisma.course.findFirst({
    where: { courseName: session.courseName },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        courseName: session.courseName,
        courseTitle: session.courseName,
      },
    });
  }

  // Create the session
  await prisma.session.create({
    data: {
      name: session.name,
      description: session.description,
      startDate: new Date(session.startDate),
      endDate: new Date(session.endDate),
      owner: session.owner,
      userId: user.id,
      courseId: course.id,
    },
  });

  // After creating, redirect to the sessions page
  redirect('/sessions');
}

/**
 * Fetches all study sessions from the database with course and user information.
 */
export async function getSessions() {
  const sessions = await prisma.session.findMany({
    include: {
      course: true,
      user: true,
    },
    orderBy: {
      startDate: 'asc',
    },
  });

  return sessions.map(session => ({
    id: session.id,
    name: session.name,
    description: session.description,
    startDate: session.startDate.toISOString(),
    endDate: session.endDate.toISOString(),
    owner: session.owner,
    course: session.course.courseName,
    courseTitle: session.course.courseTitle,
  }));
}
