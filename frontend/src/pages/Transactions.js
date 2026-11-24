import React, { useCallback, useEffect, useRef, useState } from 'react';
import ExpensesList from '../components/ExpensesList';
import ConfirmDelete from '../components/ConfirmDelete';
import { deleteExpense, fetchExpenses } from '../utils/api';
import { exportExpenses } from '../utils/exportExpenses';

const INITIAL_FILTERS = { category_id: '', start_date: '', end_date: '' };

function filtersForApi(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
}

export default function Transactions({ active, revision, categories, onAdd, onEdit, onChanged }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [applied, setApplied] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(null);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const listRequest = useRef(null);

  const loadFirst = useCallback(async () => {
    listRequest.current?.abort();
    const controller = new AbortController();
    listRequest.current = controller;
    const { signal } = controller;
    setWorking('load');
    setError('');
    try {
      const result = await fetchExpenses(filtersForApi(applied), signal);
      if (!signal?.aborted) setPage(result);
    } catch {
      if (!signal?.aborted) setError('We couldn’t load the transactions. Try again.');
    } finally {
      if (!signal?.aborted) setWorking('');
    }
  }, [applied]);

  useEffect(() => {
    if (!active) return undefined;
    loadFirst();
    return () => listRequest.current?.abort();
  }, [active, revision, loadFirst]);

  const handleMore = async () => {
    listRequest.current?.abort();
    const controller = new AbortController();
    listRequest.current = controller;
    const { signal } = controller;
    setWorking('more');
    setError('');
    try {
      const next = await fetchExpenses({ ...filtersForApi(applied), offset: page.offset + page.total }, signal);
      if (!signal.aborted) {
        setPage({ ...next, expenses: [...new Map([...page.expenses, ...next.expenses].map(row => [row.id, row])).values()] });
      }
    } catch {
      if (!signal.aborted) setError('We couldn’t load the next page. Try again.');
    } finally {
      if (!signal.aborted) setWorking('');
    }
  };

  const handleExport = async () => {
    setWorking('export');
    setError('');
    try {
      await exportExpenses(filtersForApi(applied));
    } catch {
      setError('We couldn’t export the transactions. Try again.');
    } finally {
      setWorking('');
    }
  };

  const handleDelete = async () => {
    setWorking('delete');
    setDeleteError('');
    try {
      await deleteExpense(pendingDelete.id);
      setPendingDelete(null);
      setNotice('Expense deleted.');
      setPage(previous => ({ ...previous, expenses: previous.expenses.filter(row => row.id !== pendingDelete.id) }));
      await onChanged();
    } catch {
      setDeleteError('We couldn’t delete the expense. Try again.');
    } finally {
      setWorking('');
    }
  };

  const updateFilter = event => {
    const { name, value } = event.target;
    setFilters(previous => ({ ...previous, [name]: value }));
  };
  const filtered = Object.values(applied).some(Boolean);
  const busy = Boolean(working);

  return (
    <>
      <header className="page-heading">
        <div><h1>Transactions</h1><p className="muted">Review, filter and export your recorded expenses.</p></div>
        <button className="btn btn-secondary" onClick={handleExport} disabled={busy || !page?.expenses.length}>
          {working === 'export' ? 'Exporting…' : 'Export CSV'}
        </button>
      </header>
      <form className="card filters" onSubmit={event => {
        event.preventDefault();
        setPage(null);
        setApplied({ ...filters });
      }}>
        <label>Category<select className="form-select" name="category_id" value={filters.category_id} onChange={updateFilter}>
          <option value="">All categories</option>
          {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select></label>
        <label>From<input className="form-input" type="date" name="start_date"
          value={filters.start_date} max={filters.end_date || undefined} onChange={updateFilter} /></label>
        <label>To<input className="form-input" type="date" name="end_date"
          value={filters.end_date} min={filters.start_date || undefined} onChange={updateFilter} /></label>
        <div className="actions">
          <button className="btn btn-primary" disabled={busy}>Apply filters</button>
          <button type="button" className="btn btn-secondary" disabled={busy}
            onClick={() => { setFilters(INITIAL_FILTERS); setApplied({ ...INITIAL_FILTERS }); }}>Clear</button>
        </div>
      </form>

      <section className="card" aria-labelledby="transaction-results">
        <div className="section-heading"><h2 id="transaction-results">Expense history</h2>
          {page && <p className="muted" role="status">{page.expenses.length} {page.hasMore ? 'loaded' : 'expenses'}</p>}
        </div>
        {notice && <p className="success" role="status">{notice}</p>}
        {error && <div className="error" role="alert"><p>{error}</p>
          <button className="btn btn-secondary" onClick={() => loadFirst()}>Reload transactions</button></div>}
        {page?.expenses.length > 0 && <ExpensesList expenses={page.expenses} onEdit={onEdit}
          onDelete={expense => { setPendingDelete(expense); setDeleteError(''); }} busy={busy} />}
        {working === 'load' && <p className="empty" role="status">Loading transactions…</p>}
        {page && !page.expenses.length && !busy && !error && (
          <div className="empty">
            <p>{filtered ? 'No expenses match these filters.' : 'No expenses yet.'}</p>
            {!filtered && <button className="btn btn-primary" onClick={onAdd}>Add your first expense</button>}
          </div>
        )}
        {page?.hasMore && <button className="btn btn-secondary" onClick={handleMore} disabled={busy}>
          {working === 'more' ? 'Loading…' : 'Load more expenses'}
        </button>}
      </section>
      {pendingDelete && active && <ConfirmDelete title="Delete this expense?"
        message={pendingDelete.description || 'This expense will be permanently deleted.'}
        busy={working === 'delete'} error={deleteError}
        onCancel={() => setPendingDelete(null)} onConfirm={handleDelete} />}
    </>
  );
}
