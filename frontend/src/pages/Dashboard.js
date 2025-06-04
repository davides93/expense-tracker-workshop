import React from 'react';
import ExpensesList from '../components/ExpensesList';
import StatsCards from '../components/StatsCards';
import ExpenseChart from '../components/ExpenseChart';

const Dashboard = ({ expenses, categories, dashboardStats }) => {
  return (
    <div className="dashboard">
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
      </div>

      <div className="grid grid-2">
        {/* Chart Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 Expense Analytics</h3>
          </div>
          <ExpenseChart 
            data={dashboardStats?.expensesByCategory || []}
            recentExpenses={dashboardStats?.recentExpenses || []}
          />
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">💳 Recent Expenses</h3>
          </div>
          <ExpensesList 
            expenses={expenses.slice(0, 5)} 
            categories={categories}
            showAll={false}
          />
          {expenses.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>
                Showing 5 of {expenses.length} expenses
              </span>
            </div>
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
            {dashboardStats.budgetOverview.map((budget, index) => (
              <div key={index} className="stat-card">
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
                  {budget.percentage_used?.toFixed(1) || 0}%
                </div>
                <div className="stat-label">
                  €{budget.spent_amount || 0} / €{budget.budget_amount || 0}
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#e0e0e0', 
                  borderRadius: '4px',
                  marginTop: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(budget.percentage_used || 0, 100)}%`,
                    height: '100%',
                    backgroundColor: budget.percentage_used > 90 ? '#e74c3c' : 
                                   budget.percentage_used > 70 ? '#f39c12' : '#27ae60',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            ))}
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
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;