'use client';

import { useSession } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { createSession } from '@/lib/dbActions';

type CreateSessionForm = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  course: string;
  owner: string;
};

const CreateSessionPage: React.FC = () => {
  const { data: session, status } = useSession();
  const currentUser = session?.user?.email || '';

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Session name is required'),
    description: Yup.string().required('Description is required'),
    startDate: Yup.string().required('Start date is required'),
    endDate: Yup.string()
      .required('End date is required')
      .test('is-after-start', 'End date must be after start date', function test(value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(value) > new Date(startDate);
      }),
    course: Yup.string().required('Course is required'),
    owner: Yup.string().required(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSessionForm>({
    resolver: yupResolver(validationSchema),
  });

  const [coursesList, setCoursesList] = useState<{ courseName: string; courseTitle: string }[]>([]);
  const [showCourses, setShowCourses] = useState(false);

  useEffect(() => {
    // Fetch the default courses from the API route
    fetch('/api/default-courses')
      .then((r) => r.json())
      .then((json) => setCoursesList(json))
      .catch(() => setCoursesList([]));
  }, []);

  const onSubmit = async (data: CreateSessionForm) => {
    try {
      await createSession({
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        courseName: data.course,
        owner: currentUser,
      });
      swal('Success', 'Your session has been created', 'success', {
        timer: 2000,
      });
    } catch (error) {
      swal('Error', 'Failed to create session', 'error');
      console.error('Error creating session:', error);
    }
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={10} md={8} lg={6}>
          <Col className="text-center">
            <h2>Create Study Session</h2>
          </Col>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3">
                  <Form.Label>Session Name</Form.Label>
                  <input
                    type="text"
                    {...register('name')}
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter session name"
                  />
                  <div className="invalid-feedback">{errors.name?.message}</div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <textarea
                    {...register('description')}
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    rows={3}
                    placeholder="Describe what will be covered in this session"
                  />
                  <div className="invalid-feedback">{errors.description?.message}</div>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date & Time</Form.Label>
                      <input
                        type="datetime-local"
                        {...register('startDate')}
                        className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.startDate?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date & Time</Form.Label>
                      <input
                        type="datetime-local"
                        {...register('endDate')}
                        className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.endDate?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Course</Form.Label>
                  {coursesList.length === 0 ? (
                    <div className="text-muted">Loading courses...</div>
                  ) : (
                    <>
                      <Button
                        variant="outline-secondary"
                        className="d-block mb-2"
                        onClick={() => setShowCourses((s) => !s)}
                        aria-expanded={showCourses}
                        aria-controls="courses-dropdown"
                      >
                        {showCourses ? 'Hide courses' : 'Select course'}
                      </Button>

                      <div
                        id="courses-dropdown"
                        style={{
                          display: showCourses ? 'block' : 'none',
                          maxHeight: 240,
                          overflowY: 'auto',
                          border: '1px solid #e5e5e5',
                          padding: '0.5rem',
                          borderRadius: 4,
                        }}
                      >
                        {coursesList.map((c) => (
                          <div className="form-check" key={c.courseName}>
                            <input
                              className="form-check-input"
                              type="radio"
                              id={`course-${c.courseName}`}
                              value={c.courseName}
                              {...register('course')}
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
                  <div className="invalid-feedback d-block">{errors.course?.message}</div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Owner</Form.Label>
                  <input
                    type="text"
                    {...register('owner')}
                    value={currentUser}
                    className="form-control"
                    readOnly
                  />
                </Form.Group>

                <Form.Group>
                  <Row className="pt-3">
                    <Col>
                      <Button type="submit" variant="primary">
                        Create Session
                      </Button>
                    </Col>
                    <Col>
                      <Button type="button" onClick={() => reset()} variant="warning" className="float-end">
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
  );
};

export default CreateSessionPage;
