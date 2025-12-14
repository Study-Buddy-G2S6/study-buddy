'use client';

import { Button } from 'react-bootstrap';

export default function DeleteForm({ sessionId, action }: { sessionId: number; action: (formData: FormData) => void }) {
  return (
    <form
      action={action}
      style={{ display: 'inline' }}
      onSubmit={(e) => {
        if (!confirm('Permanently delete this session? This cannot be undone.')) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="sessionId" value={sessionId} />
      <Button variant="danger" size="sm" type="submit">
        Delete
      </Button>
    </form>
  );
}
