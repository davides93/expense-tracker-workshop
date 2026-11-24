import React, { useState } from 'react';
import { createCategory } from '../utils/api';
import { responseMessage } from '../utils/presentation';

export default function Categories({ categories, onChanged }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#16745c');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const submit = async event => {
    event.preventDefault();
    const trimmed = name.trim();
    setError('');
    setNotice('');
    if (!trimmed) { setError('Enter a category name.'); return; }
    if (categories.some(category => category.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A category with this name already exists.');
      return;
    }
    setSaving(true);
    try {
      await createCategory({ name: trimmed, color });
      setName('');
      setNotice('Category added.');
      await onChanged();
    } catch (requestError) {
      setError(responseMessage(requestError, 'We couldn’t save the category. Try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="page-heading"><div><h1>Categories</h1>
        <p className="muted">Organize expenses with default and custom categories.</p></div></header>
      <form className="card editor" onSubmit={submit} aria-labelledby="new-category">
        <h2 id="new-category">New category</h2>
        {notice && <p className="success" role="status">{notice}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <fieldset disabled={saving}>
          <div className="form-grid category-fields">
            <label>Name<input className="form-input" value={name} maxLength={100}
              onChange={event => { setName(event.target.value); setError(''); }} required /></label>
            <label>Color<input className="form-input color-input" type="color" value={color}
              onChange={event => setColor(event.target.value)} /></label>
          </div>
          <button className="btn btn-primary">{saving ? 'Saving…' : 'Add category'}</button>
        </fieldset>
      </form>
      <section className="card" aria-labelledby="category-list">
        <h2 id="category-list">Available categories</h2>
        <ul className="category-list">
          {categories.map(category => (
            <li key={category.id}>
              <span className="color-dot" style={{ backgroundColor: category.color || '#16745c' }} aria-hidden="true" />
              <span>{category.name}</span>
              <span className="muted">{category.is_default ? 'Default' : 'Custom'}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
