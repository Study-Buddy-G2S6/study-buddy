'use server';

import { Stuff, Condition, Session } from '@prisma/client';
import { hash } from 'bcrypt';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

/**
 * Adds a new stuff to the database.
 * @param stuff, an object with the following properties: name, quantity, owner, condition.
 */
export async function addStuff(stuff: {
  name: string;
  quantity: number;
  owner: string;
  condition: string;
}) {
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

export async function createSession(session: {
  name: string;
  courseId: number;
  location: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  userId: number;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  await prisma.session.create({
    data: {
      name: session.name,
      userId: session.userId,
      courseId: session.courseId,
      location: session.location,
      description: session.description || '',
      startDate: session.startDate,
      endDate: session.endDate,
      owner: session.owner,
    },
  });
  redirect('/calendar');
}

export async function editSession(session: Session) {
  await prisma.session.update({
    where: { id: session.id },
    data: {
      name: session.name,
      userId: session.userId,
      courseId: session.courseId,
      location: session.location,
      description: session.description || '',
      startDate: session.startDate,
      endDate: session.endDate,
      owner: session.owner,
    },
  });
  redirect('/calendar');
}

export async function deleteSession(id: number) {
  await prisma.session.delete({
    where: { id },
  });
  redirect('/session/my-sessions');
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

export async function getCourseById(courseId: number) {
  return prisma.course.findUnique({
    where: { id: courseId },
  });
}

export async function getUserById(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function getCourseAndUserById(courseId: number, userId: number) {
  const [course, user] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);
  return { course, user };
}
