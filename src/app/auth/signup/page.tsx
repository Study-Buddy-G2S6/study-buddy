'use client';

// import React, { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// /**
//  * Signup has been disabled. Redirect users to the sign-in page.
//  */
// const SignUp = () => {
//   const router = useRouter();
//   useEffect(() => {
//     router.push('/auth/signin');
//   }, [router]);

//   return (
//     <main>
//       <div style={{ padding: '4rem', textAlign: 'center' }}>
//         <h1>Sign Up Disabled</h1>
//         <p>Account self-registration has been disabled. Please sign in with your university account.</p>
//         <a href="/auth/signin">Go to Sign In</a>
//       </div>
//     </main>
//   );
// };

// export default SignUp;

import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Card, Col, Container, Button, Form, Row } from 'react-bootstrap';
import { createUser } from '@/lib/dbActions';

type SignUpForm = {
  email: string;
  password: string;
  confirmPassword: string;
  // optional fields
  userName?: string;
  description?: string;
  // We'll read course selections as an array of courseName strings
  // allow undefined entries because yupResolver may infer (string | undefined)[]
  courses?: (string | undefined)[];
  // acceptTerms: boolean;
};

/** The sign up page. */
const SignUp = () => {
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required('Email is required')
      .email('Email is invalid')
      .matches(/@hawaii.edu$/i, 'Email must be a hawaii.edu address'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(40, 'Password must not exceed 40 characters'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password'), ''], 'Confirm Password does not match'),
    userName: Yup.string(),
    description: Yup.string(),
    courses: Yup.array().of(Yup.string()),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: yupResolver(validationSchema),
  });

  const [coursesList, setCoursesList] = useState<{ courseName: string; courseTitle: string }[]>([]);
  const [coursesDb, setCoursesDb] = useState<{ id: number; courseName: string; courseTitle: string }[]>([]);
  const [showCourses, setShowCourses] = useState(false);

  useEffect(() => {
    // fetch the default courses from the new api route
    fetch('/api/default-courses')
      .then((r) => r.json())
      .then((json) => setCoursesList(json))
      .catch(() => setCoursesList([]));

    // fetch actual DB courses (if you've seeded them) so we can connect by id
    fetch('/api/courses')
      .then((r) => r.json())
      .then((json) => setCoursesDb(json))
      .catch(() => setCoursesDb([]));
  }, []);

  const onSubmit = async (data: SignUpForm) => {
    // map the selected course names to objects so the server action can create/connect them
    const selected = data.courses ?? [];
    // prefer to send objects with `id` when the course exists in the DB so createUser connects
    const courseObjects = selected.map((name) => {
      const foundDb = coursesDb.find((c) => c.courseName === name);
      if (foundDb) return { id: foundDb.id, courseName: foundDb.courseName, courseTitle: foundDb.courseTitle };
      const found = coursesList.find((c) => c.courseName === name);
      return { courseName: name, courseTitle: found?.courseTitle ?? name };
    });

    // send the shaped payload to the server action
    await createUser({
      email: data.email,
      password: data.password,
      userName: data.userName ?? data.email,
      description: data.description ?? '',
      courses: courseObjects,
      profileImage: '/default-profile.png',
    });

    // After creating, signIn with redirect to the add page
    await signIn('credentials', { callbackUrl: '/add', ...data });
  };

  return (
    <main>
      <Container>
        <Row className="justify-content-center">
          <Col xs={5}>
            <h1 className="text-center">Sign Up</h1>
            <Card>
              <Card.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group className="form-group">
                    <Form.Label>Email</Form.Label>
                    <input
                      type="text"
                      {...register('email')}
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.email?.message}</div>
                  </Form.Group>
                  <Form.Group className="form-group mt-2">
                    <Form.Label>User Name</Form.Label>
                    <input
                      type="text"
                      {...register('userName')}
                      className={`form-control ${errors.userName ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.userName?.message}</div>
                  </Form.Group>

                  <Form.Group className="form-group mt-2">
                    <Form.Label>Password</Form.Label>
                    <input
                      type="password"
                      {...register('password')}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.password?.message}</div>
                  </Form.Group>
                  <Form.Group className="form-group mt-2">
                    <Form.Label>Confirm Password</Form.Label>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                  </Form.Group>
                  <Form.Group className="form-group mt-2">
                    <Form.Label>Description</Form.Label>
                    <textarea
                      {...register('description')}
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.description?.message}</div>
                  </Form.Group>
                  <Form.Group className="form-group mt-2">
                    <Form.Label>Courses</Form.Label>
                    {coursesList.length === 0 ? (
                      <div className="text-muted">No available courses...</div>
                    ) : (
                      <>
                        <Button
                          variant="outline-secondary"
                          className="ms-2"
                          onClick={() => setShowCourses((s) => !s)}
                          aria-expanded={showCourses}
                          aria-controls="courses-dropdown"
                        >
                          {showCourses ? 'Hide courses' : 'Select courses'}
                        </Button>

                        <div
                          id="courses-dropdown"
                          style={{
                            display: showCourses ? 'block' : 'none',
                            maxHeight: 240,
                            overflowY: 'auto',
                            marginTop: '0.5rem',
                            border: '1px solid #e5e5e5',
                            padding: '0.5rem',
                            borderRadius: 4,
                          }}
                        >
                          {coursesList.map((c) => (
                            <div className="form-check" key={c.courseName}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`course-${c.courseName}`}
                                value={c.courseName}
                                {...register('courses')}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`course-${c.courseName}`}
                              >
                                {`${c.courseName} - ${c.courseTitle}`}
                              </label>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="invalid-feedback">{errors.courses?.message}</div>
                  </Form.Group>
                  <Form.Group className="form-group py-3">
                    <Row>
                      <Col>
                        <Button type="submit" className="btn btn-primary">
                          Register
                        </Button>
                      </Col>
                      <Col>
                        <Button type="button" onClick={() => reset()} className="btn btn-warning float-right">
                          Reset
                        </Button>
                      </Col>
                    </Row>
                  </Form.Group>
                </Form>
              </Card.Body>
              <Card.Footer>
                Already have an account?
                <a href="/auth/signin">Sign in</a>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default SignUp;
