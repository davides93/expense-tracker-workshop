import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Dashboard from './pages/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import { fetchExpenses, fetchCategories, fetchDashboardStats } from './utils/api';

const Transactions = lazy(() => import('./pages/Transactions'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Categories = lazy(() => import('./pages/Categories'));
const Reports = lazy(() => import('./pages/Reports'));

const navigation = [
  ['dashboard', 'Overview'],
  ['transactions', 'Transactions'],
  ['budgets', 'Budgets'],
  ['categories', 'Categories'],
  ['reports', 'Reports'],
];

function currentPage() {
  const route = window.location.hash.slice(1);
  return route === 'expense' || navigation.some(([id]) => id === route) ? route : 'dashboard';
}

export default function App() {
  const [page, setPage] = useState(currentPage);
  const [visitedTransactions, setVisitedTransactions] = useState(page === 'transactions');
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editor, setEditor] = useState({ expense: null, returnTo: 'dashboard' });
  const [savingExpense, setSavingExpense] = useState(false);
  const main = useRef(null);
  const firstPage = useRef(true);
  const refreshSequence = useRef(0);

  const refreshOverview = useCallback(async () => {
    const sequence = ++refreshSequence.current;
    setRefreshing(true);
    setError('');
    try {
      const [recent, categories, stats] = await Promise.all([
        fetchExpenses({ limit: 5 }), fetchCategories(), fetchDashboardStats(),
      ]);
      if (sequence === refreshSequence.current) {
        setData({ expenses: recent.expenses, categories, stats, revision: sequence });
      }
    } catch {
      if (sequence === refreshSequence.current) setError('We couldn’t load the latest data. Try refreshing.');
    } finally {
      if (sequence === refreshSequence.current) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshOverview();
    const syncRoute = () => {
      setPage(currentPage());
      setNotice('');
    };
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, [refreshOverview]);

  useEffect(() => {
    if (page === 'transactions') setVisitedTransactions(true);
    if (firstPage.current) {
      firstPage.current = false;
      return;
    }
    main.current?.focus();
    window.scrollTo(0, 0);
  }, [page]);

  const navigate = destination => {
    if (destination === page) return;
    window.history.pushState(null, '', '#' + destination);
    setPage(destination);
    setNotice('');
  };

  const startExpense = (expense = null) => {
    if (savingExpense) return;
    setEditor({ expense, returnTo: page === 'expense' ? editor.returnTo : page });
    navigate('expense');
  };

  const expenseSaved = async message => {
    if (currentPage() === 'expense') navigate(editor.returnTo);
    setNotice(message);
    await refreshOverview();
  };

  return (
    <div className="workspace">
      <a className="skip-link" href="#main-content" onClick={event => {
        event.preventDefault();
        main.current?.focus();
      }}>Skip to content</a>
      <aside className="sidebar">
        <a className="brand" href="#dashboard"><span className="brand-mark" aria-hidden="true">ET</span> Expense Tracker</a>
        <nav aria-label="Main navigation">
          {navigation.map(([id, label]) => (
            <a href={'#' + id} key={id} aria-current={page === id ? 'page' : undefined}>{label}</a>
          ))}
        </nav>
      </aside>

      <div className="work-area">
        <header className="toolbar">
          <div className="actions">
            <button type="button" className="btn btn-secondary" onClick={refreshOverview}
              disabled={refreshing || savingExpense} aria-label="Refresh expense data">
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            {page !== 'expense' && <button type="button" className="btn btn-primary" onClick={() => startExpense()}
              disabled={!data || savingExpense}>
              <span aria-hidden="true">+</span> Add expense
            </button>}
          </div>
        </header>

        <main className="content" id="main-content" tabIndex={-1} ref={main}>
          {notice && <p className="success" role="status">{notice}</p>}
          {error && (
            <div className="error" role="alert">
              <p>{error}</p>
              <button className="btn btn-secondary" onClick={refreshOverview}>Try again</button>
            </div>
          )}

          {!data && refreshing && <p className="card" role="status">Loading expense tracker…</p>}
          <Suspense fallback={<p className="card" role="status">Loading page…</p>}>
            {data && page === 'dashboard' && (
              <Dashboard {...data} onAddExpense={() => startExpense()} />
            )}
            {data && (visitedTransactions || page === 'transactions') && <div hidden={page !== 'transactions'}>
              <Transactions active={page === 'transactions'} revision={data.revision} categories={data.categories}
                onAdd={() => startExpense()} onEdit={startExpense} onChanged={refreshOverview} />
            </div>}
            {data && page === 'expense' && (
              <ExpenseForm key={editor.expense?.id ?? 'new'} expense={editor.expense}
                categories={data.categories} onExpenseSaved={expenseSaved}
                onCancel={() => navigate(editor.returnTo)} onSaving={setSavingExpense} />
            )}
            {data && page === 'budgets' && <Budgets categories={data.categories} onChanged={refreshOverview} revision={data.revision} />}
            {data && page === 'categories' && <Categories categories={data.categories} onChanged={refreshOverview} />}
            {data && page === 'reports' && <Reports revision={data.revision} />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
