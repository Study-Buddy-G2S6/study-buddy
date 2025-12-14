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
  await prisma.$transaction(async (tx) => {
    await tx.session.create({
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

    await tx.user.update({
      where: { id: session.userId },
      data: {
        points: {
          increment: 1,
        },
      },
    });
  });
  redirect('/calendar/all-sessions');
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
  redirect('/session/my-sessions');
}

export async function deleteSession(id: number) {
  const existing = await prisma.session.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing) {
    redirect('/session/my-sessions');
  }

  await prisma.$transaction(async (tx) => {
    await tx.session.delete({
      where: { id },
    });

    const updatedUser = await tx.user.update({
      where: { id: existing!.userId },
      data: {
        points: {
          decrement: 1,
        },
      },
      select: { points: true },
    });

    if (updatedUser.points < 0) {
      await tx.user.update({
        where: { id: existing!.userId },
        data: { points: 0 },
      });
    }
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

  const courses = credentials.courses ?? [];

  const getCoursePayload = (c: any) => {
    if (typeof c === 'string') {
      return { create: { courseName: c, courseTitle: c } };
    }
    if ('id' in c && c.id) {
      return { connect: { id: c.id } };
    }
    return { create: { courseName: c.courseName, courseTitle: c.courseTitle ?? c.courseName } };
  };

  await prisma.user.create({
    data: {
      email: credentials.email,
      password,
      userName: credentials.userName ?? credentials.email,
      description: credentials.description,
      profileImage: credentials.profileImage,
      ...(courses.length > 0 && {
        courses: {
          create: (courses as any[]).map((c) => ({
            course: getCoursePayload(c),
          })),
        },
      }),
    },
  });
}

/**
 * Edits an existing user in the database.
 * @param credentials,
 * an object with the following properties: id, email, userName, description, profileImage, and optional courses.
 */
export async function editUser(credentials: {
  id: number;
  email: string;
  password: string;
  userName: string;
  description: string;
  profileImage: string;
  // Accept a flexible courses payload: existing Course objects (with id),
  // an array of courseName strings, or objects with courseName/courseTitle.
  courses?: Array<{ id?: number; courseName?: string; courseTitle?: string } | string>;
}) {
  // console.log(`editUser data: ${JSON.stringify(credentials, null, 2)}`);

  const courses = credentials.courses ?? [];

  const getCoursePayload = (c: any) => {
    if (typeof c === 'string') {
      return { create: { courseName: c, courseTitle: c } };
    }
    if ('id' in c && c.id) {
      return { connect: { id: c.id } };
    }
    return { create: { courseName: c.courseName, courseTitle: c.courseTitle ?? c.courseName } };
  };

  await prisma.user.update({
    where: { id: credentials.id },
    data: {
      email: credentials.email,
      userName: credentials.userName,
      description: credentials.description,
      profileImage: credentials.profileImage,
      ...(courses.length > 0 && {
        courses: {
          deleteMany: {},
          create: (courses as any[]).map((c) => ({
            course: getCoursePayload(c),
          })),
        },
      }),
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

// // find one
// await prisma.courseToUser.findUnique({
//   where: { userId_courseId: { userId, courseId } },
//   include: { course: true, user: true },
// });

// // insert or ensure exists
// await prisma.courseToUser.upsert({
//   where: { userId_courseId: { userId, courseId } },
//   create: { userId, courseId },
//   update: {}, // no-op for pure connect
// });

// // delete the link
// await prisma.courseToUser.delete({
//   where: { userId_courseId: { userId, courseId } },
// });

export async function getUserWithEnrolledCourses(userId: number | string) {
  const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
  return prisma.user.findUnique({
    where: { id },
    include: {
      courses: {
        include: { course: true },
      },
    },
  });
}
