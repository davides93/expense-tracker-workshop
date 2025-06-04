import React from 'react';

const StatsCards = ({ stats }) => {
  const currentMonth = stats?.currentMonth || {};
  
  return (
    <div className="grid grid-4">
      <div className="stat-card">
        <div className="stat-value">
          €{currentMonth.total_amount || '0.00'}
        </div>
        <div className="stat-label">This Month</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-value">
          {currentMonth.total_expenses || 0}
        </div>
        <div className="stat-label">Transactions</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-value">
          €{currentMonth.total_amount && currentMonth.total_expenses 
            ? (currentMonth.total_amount / currentMonth.total_expenses).toFixed(2) 
            : '0.00'}
        </div>
        <div className="stat-label">Avg per Transaction</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-value">
          {stats?.expensesByCategory?.length || 0}
        </div>
        <div className="stat-label">Active Categories</div>
      </div>
    </div>
  );
};

export default StatsCards;