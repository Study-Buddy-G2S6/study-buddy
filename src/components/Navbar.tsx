/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Nav, Navbar, NavDropdown, Badge } from 'react-bootstrap';
import {
  BoxArrowRight,
  Lock,
  House,
  GearFill,
  Calendar3Event,
  PeopleFill,
  PersonFill,
} from 'react-bootstrap-icons';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const user = session?.user as { email?: string; name?: string; role?: string } | null;
  const isLoggedIn = !!user?.email;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow">
      <Container className="d-flex align-items-center">
        {/* UH Seal + Study Buddy — Bigger & Centered */}
        <Navbar.Brand as={Link} href={isLoggedIn ? '/user-home' : '/'} className="d-flex align-items-center">
          <Image
            src="/uh-seal.png"
            alt="UH Mānoa"
            width={60}
            height={60}
            className="me-3 rounded-circle shadow-sm"
            priority
            style={{ objectFit: 'contain' }}
          />
          <div>
            <div className="fw-bold fs-4 text-white">Study Buddy</div>
            <div className="text-success small fw-medium">UH Mānoa • ICS Study Sessions</div>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            {isLoggedIn && (
              <>
                <Nav.Link as={Link} href="/user-home" active={pathname === '/user-home'}>
                  <House className="me-1" />
                  <span>Home</span>
                </Nav.Link>
                <Nav.Link as={Link} href="/session" active={pathname.startsWith('/session')}>
                  <PeopleFill className="me-1" />
                  <span>Study Sessions</span>
                </Nav.Link>
                <Nav.Link as={Link} href="/session/my-sessions" active={pathname.startsWith('/session/my-sessions')}>
                  <PersonFill className="me-1" />
                  <span>My Sessions</span>
                </Nav.Link>
                <Nav.Link as={Link} href="/session/add" active={pathname === '/session/add'}>
                  Create Session
                </Nav.Link>
                <Nav.Link as={Link} href="/calendar/all-sessions" active={pathname === '/calendar/all-sessions'}>
                  <Calendar3Event className="me-1" />
                  <span>Calendar</span>
                </Nav.Link>
                {isAdmin && (
                  <Nav.Link
                    as={Link}
                    href="/admin-dashboard"
                    className="text-warning fw-bold"
                    active={pathname === '/admin-dashboard'}
                  >
                    <GearFill className="me-1" />
                    <span>Admin</span>
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>

          <Nav>
            {session ? (
              <NavDropdown
                title={(
                  <span className="text-white fw-medium">
                    {user?.name?.split(' ')[0] || user?.email}
                    {isAdmin && (
                      <Badge bg="gold" text="dark" className="ms-2">
                        ADMIN
                      </Badge>
                    )}
                  </span>
                )}
                align="end"
              >
                <NavDropdown.Item as={Link} href="/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} href="/auth/change-password">
                  <Lock className="me-2" />
                  <span>Change Password</span>
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="/api/auth/signout">
                  <BoxArrowRight className="me-2" />
                  <span>Sign Out</span>
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} href="/auth/signin" className="btn btn-outline-success">
                Sign In
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
