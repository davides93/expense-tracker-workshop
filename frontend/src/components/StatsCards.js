import React from 'react';

const StatsCards = ({ stats }) => {
  const currentMonth = stats?.currentMonth || {};
  const transactionCount = Number(currentMonth.total_expenses) || 0;
  
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
          {transactionCount}
        </div>
        <div className="stat-label">Transactions</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-value">
          €{transactionCount > 0
            ? (currentMonth.total_amount / transactionCount).toFixed(2)
            : '0.00'}
        </div>
        <div className="stat-label">Avg per Transaction</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-value">
          {stats?.expensesByCategory?.filter(category => Number(category.count) > 0).length || 0}
        </div>
        <div className="stat-label">Active Categories</div>
      </div>
    </div>
  );
};

export default React.memo(StatsCards);
