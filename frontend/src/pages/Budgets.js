import React, { useCallback, useEffect, useRef, useState } from 'react';
import BudgetProgress from '../components/BudgetProgress';
import ConfirmDelete from '../components/ConfirmDelete';
import { createBudget, deleteBudget, fetchBudgets, updateBudget } from '../utils/api';
import { calendarDate, dateKey, responseMessage } from '../utils/presentation';

function budgetFields(item) {
  const today = new Date();
  return {
    id: item?.id,
    amount: item?.amount ?? '',
    category_id: item?.category_id ?? '',
    period_start: item?.period_start?.slice(0, 10) ?? dateKey(new Date(today.getFullYear(), today.getMonth(), 1)),
    period_end: item?.period_end?.slice(0, 10) ?? dateKey(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
  };
}

export default function Budgets({ categories, onChanged, revision }) {
  const [budgets, setBudgets] = useState(null);
  const [form, setForm] = useState(null);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const editor = useRef(null);

  const load = useCallback(async signal => {
    setError('');
    try {
      const result = await fetchBudgets(signal);
      if (!signal?.aborted) setBudgets(result);
    } catch {
      if (!signal?.aborted) setError('We couldn’t load budgets. Try again.');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, revision]);

  const open = item => {
    setForm(budgetFields(item));
    setFormError('');
    setNotice('');
  };

  const editing = Boolean(form);
  useEffect(() => {
    if (editing) editor.current?.focus();
  }, [editing]);

  const submit = async event => {
    event.preventDefault();
    setWorking('save');
    setFormError('');
    try {
      const { id, ...fields } = form;
      const payload = { ...fields, amount: Number(fields.amount), category_id: Number(fields.category_id) || null };
      if (id) await updateBudget(id, payload);
      else await createBudget(payload);
      setForm(null);
      setNotice(id ? 'Budget updated.' : 'Budget added.');
      await load();
      await onChanged();
    } catch (requestError) {
      setFormError(responseMessage(requestError, 'We couldn’t save the budget. Your entries are still here.'));
    } finally {
      setWorking('');
    }
  };

  const remove = async () => {
    setWorking('delete');
    setDeleteError('');
    try {
      await deleteBudget(pendingDelete.id);
      setPendingDelete(null);
      setNotice('Budget deleted.');
      await load();
      await onChanged();
    } catch {
      setDeleteError('We couldn’t delete the budget. Try again.');
    } finally {
      setWorking('');
    }
  };

  const change = event => {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
    setFormError('');
  };

  const today = dateKey();
  const budgetName = item => item.category_name || 'Overall';

  return (
    <>
      <header className="page-heading">
        <div><h1>Budgets</h1><p className="muted">Set spending limits and track progress in EUR.</p></div>
        <button className="btn btn-primary" onClick={() => open()} disabled={Boolean(form) || Boolean(working)}>Set a budget</button>
      </header>
      {notice && <p className="success" role="status">{notice}</p>}
      {error && <div className="error" role="alert"><p>{error}</p>
        <button className="btn btn-secondary" onClick={() => load()}>Reload budgets</button></div>}
      {form && (
        <form className="card editor" onSubmit={submit} aria-labelledby="budget-form">
          <h2 id="budget-form" ref={editor} tabIndex={-1}>{form.id ? 'Edit budget' : 'New budget'}</h2>
          {formError && <p className="error" role="alert">{formError}</p>}
          <fieldset disabled={Boolean(working)}>
            <div className="form-grid">
              <label>Limit (EUR)
                <input className="form-input" type="number" name="amount" value={form.amount} min="0.01"
                  max="99999999.99" step="0.01" inputMode="decimal" onChange={change} required />
              </label>
              <label>Category
                <select className="form-select" name="category_id" value={form.category_id} onChange={change}>
                  <option value="">All categories</option>
                  {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label>Starts
                <input className="form-input" type="date" name="period_start" value={form.period_start}
                  max={form.period_end || undefined} onChange={change} required />
              </label>
              <label>Ends
                <input className="form-input" type="date" name="period_end" value={form.period_end}
                  min={form.period_start || undefined} onChange={change} required />
              </label>
            </div>
            <div className="actions form-actions">
              <button className="btn btn-secondary" type="button" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn btn-primary">{working === 'save' ? 'Saving…' : 'Save budget'}</button>
            </div>
          </fieldset>
        </form>
      )}
      {!budgets && !error && <p className="card" role="status">Loading budgets…</p>}
      {budgets?.length === 0 && !form && <p className="card empty">No budgets yet. Set a limit to see your progress here.</p>}
      {budgets?.length > 0 && (
        <section aria-labelledby="budget-list">
          <h2 className="section-heading" id="budget-list">Spending limits</h2>
          <ul className="budget-grid">
            {budgets.map(item => {
              const status = today < item.period_start.slice(0, 10) ? 'Upcoming'
                : today > item.period_end.slice(0, 10) ? 'Ended' : 'Active';
              return (
                <li key={item.id} className="card">
                  <p className="muted">{status}</p>
                  <BudgetProgress name={budgetName(item)} amount={item.amount} spent={item.spent_amount}
                    period={calendarDate(item.period_start) + ' – ' + calendarDate(item.period_end)} />
                  <div className="actions">
                    <button className="btn btn-secondary" onClick={() => open(item)} disabled={Boolean(working)}
                      aria-label={'Edit ' + budgetName(item) + ' budget'}>Edit</button>
                    <button className="btn btn-danger" onClick={() => { setPendingDelete(item); setDeleteError(''); }}
                      disabled={Boolean(working)} aria-label={'Delete ' + budgetName(item) + ' budget'}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {pendingDelete && <ConfirmDelete title="Delete this budget?"
        message={budgetName(pendingDelete) + ' budget and its spending limit will be removed.'}
        busy={working === 'delete'} error={deleteError} onCancel={() => setPendingDelete(null)} onConfirm={remove} />}
    </>
  );
}
