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
  PersonFill,
  PersonPlusFill,
  House,
  GearFill,
  Calendar3Event,
  PeopleFill,
} from 'react-bootstrap-icons';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const user = session?.user as { email?: string; name?: string; role?: string } | null;
  const isLoggedIn = !!user?.email;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm py-2">
      <Container>
        {/* Brand with UH Seal */}
        <Navbar.Brand as={Link} href={isLoggedIn ? '/user-home' : '/'} className="d-flex align-items-center fw-bold">
          <Image src="/uh-seal.png" alt="UH Mānoa" width={38} height={38} className="me-2 rounded-circle" priority />
          Study Buddy
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
          {/* Left: Main Links */}
          <Nav className="me-auto">
            {isLoggedIn && (
              <>
                <Nav.Link as={Link} href="/user-home" active={pathname === '/user-home'}>
                  <House className="me-1" /> Home
                </Nav.Link>

                <Nav.Link as={Link} href="/sessions" active={pathname.startsWith('/sessions')}>
                  <PeopleFill className="me-1" /> Study Sessions
                </Nav.Link>

                <Nav.Link as={Link} href="/sessions/create" active={pathname === '/sessions/create'}>
                  Create Session
                </Nav.Link>

                <Nav.Link as={Link} href="/calendar" active={pathname === '/calendar'}>
                  <Calendar3Event className="me-1" /> Calendar
                </Nav.Link>

                {isAdmin && (
                  <Nav.Link
                    as={Link}
                    href="/admin-dashboard"
                    className="text-warning fw-bold"
                    active={pathname === '/admin-dashboard'}
                  >
                    <GearFill className="me-1" /> Admin
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>

          {/* Right: User Menu */}
          <Nav>
            {session ? (
              <NavDropdown
                title={
                  <span className="text-white">
                    {user?.name?.split(' ')[0] || user?.email}
                    {isAdmin && (
                      <Badge bg="warning" text="dark" className="ms-2">
                        ADMIN
                      </Badge>
                    )}
                  </span>
                }
                align="end"
              >
                <NavDropdown.Item as={Link} href="/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} href="/auth/change-password">
                  <Lock className="me-2" /> Change Password
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="/api/auth/signout">
                  <BoxArrowRight className="me-2" /> Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} href="/auth/signin" className="btn btn-outline-light">
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
