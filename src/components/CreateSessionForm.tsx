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
  startDate: Date;
  endDate: Date;
  userId: number;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}) => {
  // console.log(`onSubmit data: ${JSON.stringify(data, null, 2)}`);
  await createSession(data);
  swal('Success', 'Your item has been added', 'success', {
    timer: 2000,
  });
};

const CreateSessionForm = () => {
  const { data: session, status } = useSession();
  const currentUser = session?.user?.email || '';
  const [coursesList, setCoursesList] = useState<{ courseName: string; courseTitle: string; }[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  
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
          }
        })
        .catch((err) => console.error('Failed to fetch user ID', err));
    }
  }, [currentUser]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CreateSessionSchema),
  });
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

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Start Date/Time</Form.Label>
              <Form.Control
                required
                type="datetime-local"
                {...register('startDate')}
                className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
              />
              <div className="invalid-feedback">{errors.startDate?.message}</div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">End Date/Time</Form.Label>
              <Form.Control
                required
                type="datetime-local"
                {...register('endDate')}
                className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
              />
              <div className="invalid-feedback">{errors.endDate?.message}</div>
            </Form.Group>

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
            <input type="hidden" {...register('userId', { valueAsNumber: true })} value={userId || 0} />
            <input type="hidden" {...register('createdAt')} value={new Date().toISOString()} />
            <input type="hidden" {...register('updatedAt')} value={new Date().toISOString()} />

            <Form.Group className="form-group">
              <Row className="pt-3 justify-content-center">
                <Col xs="auto" md="auto" lg="auto">
                  <Button type="submit" variant="primary" size="lg">
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
