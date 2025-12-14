'use client';

import React, { useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

export default function DeleteForm({ sessionId, action }: { sessionId: number; action: (formData: FormData) => void }) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setShowConfirm(false);
    formRef.current?.submit();
  };

  return (
    <>
      <form ref={formRef} action={action} style={{ display: 'inline' }} onSubmit={handleSubmit}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <Button variant="danger" size="sm" type="submit">
          Delete
        </Button>
      </form>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Permanently delete this session? This cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
