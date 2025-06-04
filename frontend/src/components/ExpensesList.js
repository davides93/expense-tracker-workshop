import React from 'react';
import { format } from 'date-fns';

const ExpensesList = ({ expenses, categories, showAll = false }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💸</div>
        <h3>No expenses yet</h3>
        <p>Start by adding your first expense!</p>
      </div>
    );
  }

  const getCategoryInfo = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: 'Other', color: '#AED6F1', icon: 'category' };
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const displayExpenses = showAll ? expenses : expenses.slice(0, 5);

  return (
    <div className="expenses-list">
      {displayExpenses.map((expense) => {
        const category = getCategoryInfo(expense.category_id);
        
        return (
          <div key={expense.id} className="expense-item">
            <div className="expense-info">
              <div className="expense-description">
                {expense.description || 'No description'}
              </div>
              <div className="expense-meta">
                <span 
                  className="category-badge"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </span>
                <span style={{ marginLeft: '15px', color: '#999' }}>
                  📅 {formatDate(expense.expense_date)}
                </span>
              </div>
            </div>
            <div className="expense-amount">
              €{parseFloat(expense.amount).toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpensesList;