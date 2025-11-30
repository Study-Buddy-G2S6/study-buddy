import { getServerSession } from 'next-auth';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import React from 'react';
import { Container } from 'react-bootstrap';
import Profile from '@/components/Profile';
import { prisma } from '@/lib/prisma';

const UserProfile = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
      // eslint-disable-next-line @typescript-eslint/comma-dangle
    } | null,
  );

  // Load the full user record
  const userId = session && (session as any).user?.id ? parseInt((session as any).user.id as string, 10) : null;

  let fullUser = null;
  if (userId) {
    const userBasic = await prisma.user.findUnique({ where: { id: userId } });

    // Fetch courses the user is a part of
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { userId },
          { courseToUsers: { some: { userId } } },
        ],
      },
    });

    fullUser = userBasic ? { ...userBasic, courses } : null;
  }

  return (
    <main>
      <Container>
        <Profile user={(fullUser as any) ?? (session?.user as any)} />
      </Container>
    </main>
  );
};

export default UserProfile;

// interface Course {
//   code: string;
//   title: string;
// }

// /**
//  * UserProfile
//  *
//  * A simple React + TypeScript component using react-bootstrap that renders
//  * the main content from the provided HTML. All stylesheet blocks and inline
//  * style attributes have been removed. The navbar and footer are intentionally
//  * omitted; everything needed is contained in the main card content.
//  */
// const UserProfile = () => {
//   // Default data for the profile page
//   const name = 'Alice A. Kamu';
//   const avatarSrc = '/assets/img/avatar-placeholder.svg';
//   const badges = ['Sensei', 'Algorithms'];
//   const bio = 'Computer Science major who enjoys algorithms and distributed systems. '
//   + 'Happy to help with ICS 311 and ICS 314.';
//   const courses: Course[] = [
//     { code: 'ICS 111', title: 'Intro to Programming' },
//     { code: 'ICS 311', title: 'Algorithms' },
//   ];
//   const contact = '@alice#1234';
//   return (
//     <main>
//       <Container className="py-4">
//         <Card>
//           <Card.Body>
//             <Row className="align-items-center">
//               <Col xs={12} md={2} className="d-flex justify-content-center mb-3 mb-md-0">
//                 <Image src={avatarSrc} alt="avatar" width={140} height={140} rounded />
//               </Col>
//               <Col>
//                 <h1 className="mb-0">{name}</h1>
//                 <div className="mt-2">
//                   {badges.map((b) => (
//                     <Badge key={b} bg="light" text="primary" className="me-2 fw-bold small rounded-pill">
//                       {b}
//                     </Badge>
//                   ))}
//                 </div>
//                 <p className="mt-3">{bio}</p>
//               </Col>
//             </Row>
//             <section className="mt-4">
//               <h2>Courses</h2>
//               <Row className="g-3">
//                 {courses.map((c) => (
//                   <Col xs={12} md={6} key={c.code}>
//                     <Card className="p-2">
//                       <strong>{c.code}</strong>
//                       <div className="text-muted">{c.title}</div>
//                     </Card>
//                   </Col>
//                 ))}
//               </Row>
//             </section>
//             <section className="mt-4">
//               <h2>Contact</h2>
//               <p className="text-muted">
//                 Discord:
//                 <strong>{contact}</strong>
//               </p>
//             </section>
//           </Card.Body>
//         </Card>
//       </Container>
//     </main>
//   );
// };

// // Default parameter values are provided in the function signature above.

// export default UserProfile;
