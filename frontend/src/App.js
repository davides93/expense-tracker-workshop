import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import { fetchExpenses, fetchCategories, fetchDashboardStats } from './utils/api';

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [expensesData, categoriesData, statsData] = await Promise.all([
        fetchExpenses(),
        fetchCategories(),
        fetchDashboardStats()
      ]);
      
      setExpenses(expensesData.expenses || []);
      setCategories(categoriesData || []);
      setDashboardStats(statsData || {});
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    loadInitialData(); // Refresh data when expense is added
    setCurrentView('dashboard'); // Return to dashboard
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

      <nav className="container">
        <div className="card">
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${currentView === 'dashboard' ? 'btn-primary' : 'btn-warning'}`}
              onClick={() => setCurrentView('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={`btn ${currentView === 'add-expense' ? 'btn-primary' : 'btn-success'}`}
              onClick={() => setCurrentView('add-expense')}
            >
              ➕ Add Expense
            </button>
            <button 
              className="btn btn-warning"
              onClick={loadInitialData}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </nav>

      <main className="container">
        {currentView === 'dashboard' && (
          <Dashboard 
            expenses={expenses}
            categories={categories}
            dashboardStats={dashboardStats}
          />
        )}
        
        {currentView === 'add-expense' && (
          <ExpenseForm 
            categories={categories}
            onExpenseAdded={handleExpenseAdded}
          />
        )}
      </main>
    </div>
  );
};

export default App;