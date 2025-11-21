/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BoxArrowRight, Lock, PersonFill } from 'react-bootstrap-icons';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const pathName = usePathname();
  let brandHref = '/';
  if (pathName === '/user-home') brandHref = '/user-home';
  else if (pathName === '/admin') brandHref = '/admin';
  return (
    <Navbar expand="lg" variant="dark" style={{ backgroundColor: '#0b5f3d' }}>
      <Container>
        <Navbar.Brand href={brandHref}>
          Study Buddy
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto justify-content-start">
            {(() => {
              if (pathName === '/user-home') {
                return (
                  <>
                    <Nav.Link href="#" key="create-event">Create Event</Nav.Link>
                    <Nav.Link href="#" key="search-event">Search Event</Nav.Link>
                    <Nav.Link href="#" key="view-my-events">View My Events</Nav.Link>
                  </>
                );
              }
              if (pathName === '/admin') {
                return <Nav.Link href="#" key="modify-events">Modify Events</Nav.Link>;
              }
              return (
                <>
                  {currentUser == null && (
                    <Nav.Link href="/about" key="about" active={pathName === '/about'}>
                      About
                    </Nav.Link>
                  )}
                  {currentUser && (
                    <>
                      <Nav.Link href="/about" key="about" active={pathName === '/about'}>
                        About
                      </Nav.Link>
                      <Nav.Link href="/courses" key="courses" active={pathName === '/courses'}>
                        Courses
                      </Nav.Link>
                      <Nav.Link href="/help" key="help" active={pathName === '/help'}>
                        Help
                      </Nav.Link>
                      <Nav.Link href="/profile" key="profile" active={pathName === '/profile'}>
                        Profile
                      </Nav.Link>
                    </>
                  )}
                  <Nav.Link
                    id="admin-stuff-nav"
                    href="/admin"
                    key="admin"
                    active={pathName === '/admin'}
                  >
                    Admin
                  </Nav.Link>
                </>
              );
            })()}
          </Nav>
          <Nav>
            <NavDropdown id="login-dropdown" title={session ? currentUser : 'Login'}>
              <NavDropdown.Item id="login-dropdown-user-home" href="/user-home">UserHome</NavDropdown.Item>
              <NavDropdown.Item id="login-dropdown-admin-home" href="/admin">AdminHome</NavDropdown.Item>
              {!session && (
                <NavDropdown.Item id="login-dropdown-sign-in" href="/auth/signin">
                  <PersonFill />
                  {' '}
                  Sign in
                </NavDropdown.Item>
              )}
              <NavDropdown.Item id="login-dropdown-sign-up" href="/auth/signup">Sign Up</NavDropdown.Item>
              {session && (
                <>
                  <NavDropdown.Divider />
                  <NavDropdown.Item id="login-dropdown-sign-out" href="/api/auth/signout">
                    <BoxArrowRight />
                    {' '}
                    Sign Out
                  </NavDropdown.Item>
                  <NavDropdown.Item id="login-dropdown-change-password" href="/auth/change-password">
                    <Lock />
                    {' '}
                    Change Password
                  </NavDropdown.Item>
                </>
              )}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default NavBar;
