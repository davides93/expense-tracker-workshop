import React, { useEffect, useRef } from 'react';

export default function ConfirmDelete({ title, message, onCancel, onConfirm, busy, error }) {
  const dialog = useRef(null);

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  return (
    <dialog ref={dialog} aria-labelledby="confirm-delete-title" aria-describedby="confirm-delete-message"
      onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}>
      <h2 id="confirm-delete-title">{title}</h2>
      <p id="confirm-delete-message">{message}</p>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions form-actions">
        <button autoFocus className="btn btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button>
      </div>
    </dialog>
  );
}
