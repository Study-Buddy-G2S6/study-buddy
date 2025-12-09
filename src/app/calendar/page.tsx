'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

// Extract day cell renderer to avoid defining a component during render.
// This prevents React from treating it as a new component type on every render.
const DayCellContent = ({ dayNumberText }: any) => <div style={{ color: '#000' }}>{dayNumberText}</div>;

const formatCourseDisplay = (course: any) => {
  if (!course) return 'N/A';
  if (course.courseName) {
    return `${course.courseName} - ${course.courseTitle ?? ''}`;
  }
  return String(course);
};

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStart, setSelectedStart] = useState('');
  const [selectedEnd, setSelectedEnd] = useState('');
  const [formData, setFormData] = useState<any>({
    title: '',
    // `course` will be an object with at least an `id` property (matches API expectation)
    course: null,
    location: '',
    notes: '',
  });
  const [coursesList, setCoursesList] = useState<{ id: number; courseName: string; courseTitle?: string }[]>([]);
  const [message, setMessage] = useState('');

  const fetchEvents = async () => {
    const res = await fetch('/api/study-sessions');
    if (res.ok) {
      const data = await res.json();

      // Normalize API payload into FullCalendar event objects.
      const fcEvents = (data || []).map((d: any) => ({
        id: d.id?.toString(),
        title: d.name ?? d.title ?? '',
        start: d.startDate ?? d.start ?? null,
        end: d.endDate ?? d.end ?? null,
        extendedProps: {
          // API may return nested extendedProps or top-level fields depending on route
          course: d.extendedProps?.course ?? d.course ?? null,
          location: d.extendedProps?.location ?? d.location ?? '',
          description: d.extendedProps?.description ?? d.description ?? '',
          user: d.extendedProps?.user ?? d.user ?? d.owner ?? null,
        },
      }));

      setEvents(fcEvents);
    }
  };

  useEffect(() => {
    fetchEvents();
    // fetch DB courses so modal can let user choose an existing course (course.id)
    fetch('/api/courses')
      .then((r) => r.json())
      .then((json) => setCoursesList(json || []))
      .catch(() => setCoursesList([]));
  }, []);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedStart(selectInfo.startStr);
    setSelectedEnd(selectInfo.endStr || '');
    setFormData({ title: '', course: '', location: '', notes: '' });
    setMessage('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // The API expects `title`, `course` (object with id), `location`, `description`, `startDate`, `endDate`.
    const payload = {
      title: formData.title,
      course: formData.course, // object with `id`
      location: formData.location || null,
      description: formData.notes || null,
      startDate: selectedStart,
      endDate: selectedEnd || null,
    };

    const res = await fetch('/api/study-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setMessage('Session created successfully!');
      setTimeout(() => {
        setShowModal(false);
        fetchEvents();
      }, 1500);
    } else {
      // try to show error details when available
      let text = 'Error creating session.';
      try {
        const json = await res.json();
        text = json?.error ? `${text} ${json.error}` : text;
      } catch (err) {
        // ignore
      }
      setMessage(text);
      console.error('study-sessions POST failed', res);
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const { event } = clickInfo;
    const { course, location, description, user } = event.extendedProps;
    const start = event.start?.toLocaleString() ?? 'N/A';
    const end = event.end?.toLocaleString() ?? null;
    const courseDisplay = formatCourseDisplay(course);

    const details = [
      `Title: ${clickInfo.event.title}`,
      `Course: ${courseDisplay}`,
      `When: ${start}${end ? ` → ${end}` : ''}`,
      `Location: ${location || 'N/A'}`,
      `Description: ${description || 'None'}`,
      `User: ${user?.userName ?? user?.email ?? user ?? 'Unknown'}`,
    ].join('\n');

    // eslint-disable-next-line no-alert
    alert(details);
  };

  return (
    <div className="container py-5">
      {/* Black text now */}
      <h1 className="text-dark mb-4 fw-bold">My Study Calendar</h1>

      <div className="bg-white rounded-3 shadow-lg p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          selectable
          select={handleDateSelect}
          eventClick={handleEventClick}
          dayCellContent={DayCellContent}
          height="70vh"
          eventColor="#0d6efd"
          eventTextColor="#fff"
        />
      </div>

      {/* Create Session Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Create Study Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && <Alert variant={message.includes('success') ? 'success' : 'danger'}>{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Course</Form.Label>
              {coursesList.length === 0 ? (
                <Form.Control
                  required
                  value={formData.course?.courseName ?? ''}
                  onChange={(e) => setFormData({ ...formData, course: { courseName: e.target.value } })}
                  placeholder="Course"
                />
              ) : (
                <Form.Select
                  required
                  aria-label="Select course"
                  value={formData.course?.id ?? ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const selected = coursesList.find((c) => c.id === id) ?? null;
                    setFormData({ ...formData, course: selected });
                  }}
                >
                  <option value="">Choose a course...</option>
                  {coursesList.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {`${c.courseName} - ${c.courseTitle ?? ''}`}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="None"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>

            <div className="text-muted small mb-3">
              Selected:
              {new Date(selectedStart).toLocaleString()}
              {selectedEnd && ` → ${new Date(selectedEnd).toLocaleString()}`}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Session
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
