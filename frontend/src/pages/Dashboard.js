import React, { lazy, Suspense } from 'react';
import ExpensesList from '../components/ExpensesList';
import StatsCards from '../components/StatsCards';

const ExpenseChart = lazy(() => import('../components/ExpenseChart'));

const EMPTY_DATA = [];

const Dashboard = ({
  expenses, categories, dashboardStats, onAddExpense, onEditExpense, onDeleteExpense,
  actionsDisabled, onLoadMore, loadingMore, expenseError,
}) => {
  return (
    <div className="dashboard">
      {expenseError && <p className="error" role="alert">{expenseError}</p>}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Dashboard Overview</h2>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>

        {/* Statistics Cards */}
        <StatsCards stats={dashboardStats} />
        <p style={{ color: '#666', marginTop: '15px' }}>Analytics and budgets use EUR expenses.</p>
      </div>

      <div className="grid grid-2">
        {/* Chart Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 Expense Analytics</h3>
          </div>
          <Suspense fallback={<p role="status">Loading charts…</p>}>
            <ExpenseChart
              data={dashboardStats?.expensesByCategory || EMPTY_DATA}
              recentExpenses={dashboardStats?.recentExpenses || EMPTY_DATA}
            />
          </Suspense>
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">💳 Recent Expenses</h3>
          </div>
          <ExpensesList 
            expenses={expenses}
            categories={categories}
            showAll={false}
            onAddExpense={onAddExpense}
            onEditExpense={expenses.length <= 5 ? onEditExpense : undefined}
            onDeleteExpense={expenses.length <= 5 ? onDeleteExpense : undefined}
            actionsDisabled={actionsDisabled}
          />
          {expenses.length > 5 && (
            <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>
              Showing the 5 most recent expenses
            </p>
          )}
        </div>
      </div>

      {/* Budget Overview */}
      {dashboardStats?.budgetOverview && dashboardStats.budgetOverview.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Budget Overview</h3>
          </div>
          <div className="grid grid-3">
            {dashboardStats.budgetOverview.map((budget) => {
              const percentage = Number(budget.percentage_used) || 0;
              const progress = Math.max(0, Math.min(percentage, 100));
              return (
                <div key={budget.id} className="stat-card">
                  <div
                    className="category-badge"
                    style={{
                      backgroundColor: budget.color || '#667eea',
                      marginBottom: '10px',
                      display: 'inline-flex'
                    }}
                  >
                    {budget.category || 'General'}
                  </div>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                    {percentage.toFixed(1)}%
                  </div>
                  <div className="stat-label">
                    €{budget.spent_amount || 0} / €{budget.budget_amount || 0}
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${budget.category || 'General'} budget spent`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                    aria-valuetext={`${percentage.toFixed(1)}% spent`}
                    style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    marginTop: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      backgroundColor: percentage > 90 ? '#e74c3c' :
                                     percentage > 70 ? '#f39c12' : '#27ae60',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Expenses */}
      {expenses.length > 5 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📝 All Expenses</h3>
          </div>
          <ExpensesList 
            expenses={expenses} 
            categories={categories}
            showAll={true}
            onEditExpense={onEditExpense}
            onDeleteExpense={onDeleteExpense}
            actionsDisabled={actionsDisabled}
          />
          {onLoadMore && (
            <button className="btn btn-primary" onClick={onLoadMore} disabled={actionsDisabled}>
              {loadingMore ? 'Loading…' : 'Load More Expenses'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
