'use client';

import { useEffect, useState } from 'react';
import { Button, Form, Card, Row, Col } from 'react-bootstrap';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { createSession } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CreateSessionSchema } from '@/lib/validationSchemas';

const onSubmit = async (data: {
  name: string;
  courseId: number;
  location: string;
  description?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  userId: number;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}) => {
  // Combine date and times into full Date objects
  const startDate = new Date(`${data.sessionDate}T${data.startTime}`);
  const endDate = new Date(`${data.sessionDate}T${data.endTime}`);

  const sessionData = {
    name: data.name,
    courseId: data.courseId,
    location: data.location,
    description: data.description,
    startDate,
    endDate,
    userId: data.userId,
    owner: data.owner,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };

  // console.log(`onSubmit data: ${JSON.stringify(sessionData, null, 2)}`);
  await createSession(sessionData);
  swal('Success', 'Your session has been created', 'success', {
    timer: 2000,
  });
};

const CreateSessionForm = () => {
  const { data: session, status } = useSession();
  const currentUser = session?.user?.email || '';
  const [coursesList, setCoursesList] = useState<{ courseName: string; courseTitle: string; }[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [userIdError, setUserIdError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CreateSessionSchema),
  });

  useEffect(() => {
    // fetch the default courses from the new api route
    fetch('/api/default-courses')
      .then((r) => r.json())
      .then((json) => setCoursesList(json))
      .catch(() => setCoursesList([]));
  }, []);

  useEffect(() => {
    // Fetch the current user's ID from the database
    if (currentUser) {
      fetch(`/api/user-courses?email=${encodeURIComponent(currentUser)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.userId) {
            setUserId(data.userId);
            setValue('userId', data.userId, { shouldValidate: true });
            setUserIdError(null);
          } else {
            setUserIdError('Unable to load your user ID. Please try again or re-login.');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch user ID', err);
          setUserIdError('Unable to load your user ID. Please try again or re-login.');
        });
    }
  }, [currentUser, setValue]);
  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  return (
    <div className="container py-5">
      {/* This matches your navbar link exactly */}
      <h1 className="text-dark mb-5 fw-bold display-5">Create Session</h1>

      <Card className="shadow-lg border-0">
        <Card.Body className="p-5">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Name</Form.Label>
              <input
                required
                type="text"
                placeholder="e.g., ICS 311 Midterm Review"
                {...register('name')}
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              />
              <div className="invalid-feedback">{errors.name?.message}</div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Course</Form.Label>
              {coursesList.length === 0 ? (
                <Form.Control readOnly value="No available courses" />
              ) : (
                <>
                  <Form.Select
                    required
                    aria-label="Select course"
                    onChange={async (e) => {
                      const selectedName = e.target.value;
                      // clear numeric id when no selection
                      if (!selectedName) {
                        setValue('courseId', undefined as any, { shouldValidate: true });
                        return;
                      }
                      try {
                        const res = await fetch(`/api/courses/lookup?name=${encodeURIComponent(selectedName)}`);
                        if (res.ok) {
                          const json = await res.json();
                          // set the numeric courseId for submission/validation
                          setValue('courseId', Number(json.id), { shouldValidate: true });
                        } else {
                          // lookup failed: clear the id
                          setValue('courseId', undefined as any, { shouldValidate: true });
                        }
                      } catch (err) {
                        console.error('Course lookup failed', err);
                        setValue('courseId', undefined as any, { shouldValidate: true });
                      }
                    }}
                    className={`form-control ${errors.courseId ? 'is-invalid' : ''}`}
                  >
                    <option value="">Choose a course...</option>
                    {coursesList.map((c) => (
                      <option key={c.courseName} value={c.courseName}>
                        {`${c.courseName} - ${c.courseTitle}`}
                      </option>
                    ))}
                  </Form.Select>

                  {/* hidden numeric field that will be set from the lookup API */}
                  <input type="hidden" {...register('courseId', { valueAsNumber: true })} />
                  <div className="invalid-feedback">{errors.courseId?.message}</div>
                </>
              )}
            </Form.Group>

            <Row className="mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Date</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    {...register('sessionDate')}
                    className={`form-control ${errors.sessionDate ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.sessionDate?.message}</div>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Start Time</Form.Label>
                  <Form.Control
                    required
                    type="time"
                    {...register('startTime')}
                    className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.startTime?.message}</div>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">End Time</Form.Label>
                  <Form.Control
                    required
                    type="time"
                    {...register('endTime')}
                    className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.endTime?.message}</div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., POST 126, Hamilton Library, Zoom link"
                {...register('location')}
                className={`form-control ${errors.location ? 'is-invalid' : ''}`}
              />
              <div className="invalid-feedback">{errors.location?.message}</div>
            </Form.Group>

            <Form.Group className="mb-5">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Any extra details for attendees..."
                {...register('description')}
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              />
              <div className="invalid-feedback">{errors.description?.message}</div>
            </Form.Group>

            <input type="hidden" {...register('owner')} value={currentUser} />
            <input type="hidden" {...register('userId', { valueAsNumber: true })} value={userId ?? ''} />
            <input type="hidden" {...register('createdAt')} value={new Date().toISOString()} />
            <input type="hidden" {...register('updatedAt')} value={new Date().toISOString()} />

            {userIdError && (
              <div className="text-danger mb-3">{userIdError}</div>
            )}

            <Form.Group className="form-group">
              <Row className="pt-3 justify-content-center">
                <Col xs="auto" md="auto" lg="auto">
                  <Button type="submit" variant="primary" size="lg" disabled={!userId}>
                    Create Session
                  </Button>
                </Col>
                <Col xs="auto" md="auto" lg="auto">
                  <Button type="button" onClick={() => reset()} variant="warning" size="lg">
                    Reset
                  </Button>
                </Col>
              </Row>
            </Form.Group>

          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateSessionForm;
