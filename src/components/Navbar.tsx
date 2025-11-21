/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BoxArrowRight, Lock, PersonFill } from 'react-bootstrap-icons';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { email: string; randomKey: string };
  const role = userWithRole?.randomKey;
  const pathName = usePathname();
  return (
    <Navbar expand="lg" variant="dark" style={{ backgroundColor: '#0b5f3d' }}>
      <Container>
        <Navbar.Brand href="/">Study Buddy</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto justify-content-start">
            {currentUser == null ? (
              <Nav.Link href="/about" key="about" active={pathName === '/about'}>
                About
              </Nav.Link>
            ) : (
              ''
            )}
            {currentUser
              ? [
                  <Nav.Link href="/about" key="about" active={pathName === '/about'}>
                    About
                  </Nav.Link>,
                  <Nav.Link href="/courses" key="courses" active={pathName === '/courses'}>
                    Courses
                  </Nav.Link>,
                  <Nav.Link href="/help" key="help" active={pathName === '/help'}>
                    Help
                  </Nav.Link>,
                  <Nav.Link href="/profile" key="profile" active={pathName === '/profile'}>
                    Profile
                  </Nav.Link>,
                ]
              : ''}
            {currentUser && role === 'ADMIN' ? (
              <Nav.Link id="admin-stuff-nav" href="/admin" key="admin" active={pathName === '/admin'}>
                Admin
              </Nav.Link>
            ) : (
              ''
            )}
          </Nav>
          <Nav>
            {session ? (
              <NavDropdown id="login-dropdown" title={currentUser}>
                <NavDropdown.Item id="login-dropdown-user-home" href="/user-home">
                  UserHome
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-admin-home" href="/admin">
                  AdminHome
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-sign-up" href="/auth/signup">
                  Sign Up
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item id="login-dropdown-sign-out" href="/api/auth/signout">
                  <BoxArrowRight />
                  Sign Out
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-change-password" href="/auth/change-password">
                  <Lock />
                  Change Password
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown id="login-dropdown" title="Login">
                <NavDropdown.Item id="login-dropdown-sign-in" href="/auth/signin">
                  <PersonFill />
                  Sign in
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-sign-up" href="/auth/signup">
                  Sign Up
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
