import React, { useCallback, useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import { fetchExpenses, fetchCategories, fetchDashboardStats, deleteExpense } from './utils/api';

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expenseError, setExpenseError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setExpenseError(null);
      const [expensesData, categoriesData, statsData] = await Promise.all([
        fetchExpenses(),
        fetchCategories(),
        fetchDashboardStats()
      ]);
      
      setExpenses(expensesData.expenses || []);
      setHasMore(expensesData.hasMore);
      setCategories(categoriesData || []);
      setDashboardStats(statsData || {});
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setExpenseError(null);
    try {
      const page = await fetchExpenses({ offset: expenses.length });
      setExpenses(previous => [...previous, ...page.expenses]);
      setHasMore(page.hasMore);
    } catch (err) {
      setExpenseError('Failed to load more expenses. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const openExpenseForm = useCallback(expense => {
    setNotice(null);
    setEditingExpense(expense);
    setCurrentView('add-expense');
  }, []);
  const openNewExpense = () => openExpenseForm(null);

  const handleDelete = useCallback(async expense => {
    if (!window.confirm('Delete this expense?')) return;
    setDeletingId(expense.id);
    setExpenseError(null);
    try {
      await deleteExpense(expense.id);
      await loadInitialData();
      setNotice('Expense deleted.');
    } catch (err) {
      setExpenseError('Failed to delete the expense. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }, [loadInitialData]);

  const handleExpenseSaved = async message => {
    await loadInitialData();
    setCurrentView('dashboard');
    setNotice(message);
  };

  if (loading) {
    return (
      <div className="loading">
        <div>💰 Loading your expense tracker...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h2>❌ {error}</h2>
          <button className="btn btn-primary" onClick={loadInitialData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>💰 Expense Tracker</h1>
          <p>Modern Financial Management Made Simple</p>
        </div>
      </header>

      <nav className="container" aria-label="Main navigation">
        <div className="card">
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${currentView === 'dashboard' ? 'btn-primary' : 'btn-warning'}`}
              onClick={() => setCurrentView('dashboard')}
              aria-current={currentView === 'dashboard' ? 'page' : undefined}
            >
              📊 Dashboard
            </button>
            <button 
              className={`btn ${currentView === 'add-expense' ? 'btn-primary' : 'btn-success'}`}
              onClick={openNewExpense}
              aria-current={currentView === 'add-expense' ? 'page' : undefined}
            >
              ➕ Add Expense
            </button>
            <button 
              className="btn btn-warning"
              onClick={loadInitialData}
              disabled={loadingMore || deletingId !== null}
              aria-label="Refresh expense data"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </nav>

      <main className="container">
        {currentView === 'dashboard' && notice && <p className="success" role="status">{notice}</p>}
        {currentView === 'dashboard' && (
          <Dashboard 
            expenses={expenses}
            categories={categories}
            dashboardStats={dashboardStats}
            onAddExpense={openNewExpense}
            onEditExpense={openExpenseForm}
            onDeleteExpense={handleDelete}
            actionsDisabled={loadingMore || deletingId !== null}
            onLoadMore={hasMore ? handleLoadMore : undefined}
            loadingMore={loadingMore}
            expenseError={expenseError}
          />
        )}
        
        {currentView === 'add-expense' && (
          <ExpenseForm
            key={editingExpense?.id ?? 'new'}
            expense={editingExpense}
            categories={categories}
            onExpenseSaved={handleExpenseSaved}
          />
        )}
      </main>
    </div>
  );
};

export default App;
