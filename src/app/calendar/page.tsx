'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStart, setSelectedStart] = useState('');
  const [selectedEnd, setSelectedEnd] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    location: '',
    notes: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await fetch('/api/study-sessions');
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedStart(selectInfo.startStr);
    setSelectedEnd(selectInfo.endStr || '');
    setFormData({ title: '', course: '', location: '', notes: '' });
    setMessage('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      start: selectedStart,
      end: selectedEnd || null,
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
      setMessage('Error creating session.');
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const { location, notes, course } = clickInfo.event.extendedProps;
    const start = clickInfo.event.start?.toLocaleString();
    const end = clickInfo.event.end?.toLocaleString();
    alert(
      `Course: ${course}\nTitle: ${clickInfo.event.title}\nWhen: ${start}${end ? ' → ' + end : ''}\nLocation: ${location || 'N/A'}\nNotes: ${notes || 'None'}`,
    );
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
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="70vh"
          eventColor="#0d6efd"
          // Makes day numbers and event text black
          dayCellContent={(arg) => <div style={{ color: '#000' }}>{arg.dayNumberText}</div>}
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
              <Form.Label>Session Title</Form.Label>
              <Form.Control
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Midterm Review"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Course</Form.Label>
              <Form.Control
                required
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                placeholder="ICS 314"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location (optional)</Form.Label>
              <Form.Control
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="POST 126, Zoom"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>

            <div className="text-muted small mb-3">
              Selected: {new Date(selectedStart).toLocaleString()}
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
