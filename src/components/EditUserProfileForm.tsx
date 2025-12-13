'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Card, Col, Container, Button, Form, Row } from 'react-bootstrap';
import { getUserWithEnrolledCourses } from '@/lib/dbActions';
import LoadingSpinner from './LoadingSpinner';

type SignUpForm = {
  id: number;
  email: string;
  password?: string;
  userName: string;
  description?: string;
  profileImage?: string;
  // We'll read course selections as an array of courseName strings
  // allow undefined entries because yupResolver may infer (string | undefined)[]
  courses?: (string | undefined)[];
  // acceptTerms: boolean;
};

/** The sign up page. */
const EditProfileForm = ({ userId }: { userId: number }) => {
  const { data: clientSession, status } = useSession();
  const router = useRouter();
  const currentUser = clientSession?.user?.email || '';
  const effectiveUserId = userId ?? clientSession?.user?.id;
  const validationSchema = Yup.object().shape({
    id: Yup.number().required(),
    email: Yup.string().email().required(),
    password: Yup.string(),
    userName: Yup.string().required(),
    description: Yup.string(),
    profileImage: Yup.string(),
    courses: Yup.array().of(Yup.string()),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      id: effectiveUserId ? Number(effectiveUserId) : 0,
      email: currentUser,
      password: '',
      userName: '',
      description: '',
      profileImage: '/default-profile.png',
      courses: [],
    },
  });

  const [coursesList, setCoursesList] = useState<{ courseName: string; courseTitle: string }[]>([]);
  const [coursesDb, setCoursesDb] = useState<{ id: number; courseName: string; courseTitle: string }[]>([]);
  const [enrolledCourseNames, setEnrolledCourseNames] = useState<string[]>([]);
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

    // fetch the user's enrolled courses
    if (effectiveUserId) {
      getUserWithEnrolledCourses(effectiveUserId).then((userWithCourses) => {
        if (userWithCourses?.courses) {
          const enrolled = userWithCourses.courses.map((c) => c.course.courseName);
          setEnrolledCourseNames(enrolled);
          // Update form default values with enrolled courses
          reset((formValues) => ({
            ...formValues,
            id: Number(effectiveUserId),
            email: userWithCourses.email ?? currentUser,
            userName: userWithCourses.userName ?? formValues.userName,
            description: userWithCourses.description ?? formValues.description,
            courses: enrolled,
          }));
        }
      });
    }
  }, [effectiveUserId, reset, currentUser]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  const onSubmit: SubmitHandler<SignUpForm> = async (data) => {
    const idNum = Number(effectiveUserId ?? data.id);

    // map the selected course names to objects so the server action can edit/connect them
    const selected = data.courses ?? [];
    // prefer to send objects with `id` when the course exists in the DB so editUser connects
    const courseObjects = selected
      .filter((name) => name != null)
      .map((name) => {
        const foundDb = coursesDb.find((c) => c.courseName === name);
        if (foundDb) return { id: foundDb.id, courseName: foundDb.courseName, courseTitle: foundDb.courseTitle };
        const found = coursesList.find((c) => c.courseName === name);
        return { courseName: name, courseTitle: found?.courseTitle ?? name };
      });

    const res = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: idNum,
        email: data.email,
        password: data.password,
        userName: data.userName ?? data.email,
        description: data.description ?? '',
        courses: courseObjects,
        profileImage: '/default-profile.png',
      }),
    });

    if (!res.ok) {
      console.error('Failed to update user');
      return;
    }

    router.push('/profile');
  };

  return (
    <main>
      <Container>
        <Row className="justify-content-center">
          <Col xs={5}>
            <h1 className="text-center">Edit Profile</h1>
            <Card>
              <Card.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
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
                                defaultChecked={enrolledCourseNames.includes(c.courseName)}
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

                  <input type="hidden" {...register('email')} value={currentUser} />
                  <input type="hidden" {...register('id')} value={Number(effectiveUserId)} />

                  <Form.Group className="form-group py-3">
                    <Row>
                      <Col>
                        <Button type="submit" className="btn btn-primary">
                          Update
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
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default EditProfileForm;
