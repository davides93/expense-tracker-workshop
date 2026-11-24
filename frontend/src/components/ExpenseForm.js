import React, { useState } from 'react';
import { createExpense, updateExpense } from '../utils/api';
import { dateKey, responseMessage } from '../utils/presentation';

export default function ExpenseForm({ categories, expense, onExpenseSaved, onCancel, onSaving }) {
  const [form, setForm] = useState(() => ({
    amount: expense?.amount ?? '',
    currency: expense?.currency || 'EUR',
    description: expense?.description ?? '',
    expense_date: expense?.expense_date?.slice(0, 10) ?? dateKey(),
    category_id: expense?.category_id ?? '',
    receipt_url: expense?.receipt_url ?? '',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const currencies = [...new Set(['EUR', 'USD', 'GBP', form.currency])];

  const change = event => {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
    setError('');
  };

  const submit = async event => {
    event.preventDefault();
    setSaving(true);
    onSaving(true);
    setError('');
    try {
      const payload = {
        ...form, amount: Number(form.amount), category_id: Number(form.category_id) || null,
        receipt_url: form.receipt_url.trim() || null,
      };
      if (expense) await updateExpense(expense.id, payload);
      else await createExpense(payload);
      await onExpenseSaved(expense ? 'Expense updated.' : 'Expense added.');
    } catch (requestError) {
      setError(responseMessage(requestError, 'We couldn’t save the expense. Your entries are still here.'));
    } finally {
      setSaving(false);
      onSaving(false);
    }
  };

  return (
    <>
      <header className="page-heading"><h1>{expense ? 'Edit expense' : 'Add expense'}</h1></header>
      <form className="card editor" onSubmit={submit} aria-busy={saving}>
        {error && <p className="error" role="alert">{error}</p>}
        <fieldset disabled={saving}>
          <div className="form-grid">
            <label>Amount (required)
              <input className="form-input" type="number" name="amount" value={form.amount} onChange={change}
                min="0.01" max="99999999.99" step="0.01" inputMode="decimal" required />
            </label>
            <label>Currency
              <select className="form-select" name="currency" value={form.currency} onChange={change}>
                {currencies.map(code => <option key={code}>{code}</option>)}
              </select>
            </label>
            <label>Date (required)
              <input className="form-input" type="date" name="expense_date" value={form.expense_date} onChange={change} required />
            </label>
            <label>Category
              <select className="form-select" name="category_id" value={form.category_id} onChange={change}>
                <option value="">Uncategorized</option>
                {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
          </div>
          <label>Description
            <input className="form-input" name="description" value={form.description} onChange={change} />
          </label>
          <label>Receipt link (optional)
            <input className="form-input" type="url" name="receipt_url" value={form.receipt_url} onChange={change}
              placeholder="https://" maxLength={500} />
          </label>
          <div className="actions form-actions">
            <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary">{saving ? 'Saving…' : expense ? 'Save changes' : 'Save expense'}</button>
          </div>
        </fieldset>
      </form>
    </>
  );
}
