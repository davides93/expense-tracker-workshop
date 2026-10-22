import React, { useMemo } from 'react';
import { format } from 'date-fns';

const ExpensesList = ({ expenses, categories, showAll = false }) => {
  // Optimization: Map category lookup by ID in O(1) time instead of O(M) Array.find on every expense item
  // Reduces overall rendering time complexity from O(N * M) to O(N + M)
  const categoryMap = useMemo(() => {
    const map = new Map();
    if (categories && Array.isArray(categories)) {
      categories.forEach((cat) => map.set(cat.id, cat));
    }
    return map;
  }, [categories]);

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
    const category = categoryMap.get(categoryId);
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
    <div className="expenses-list" role="list" aria-label="Expenses list">
      {displayExpenses.map((expense) => {
        const category = getCategoryInfo(expense.category_id);
        
        return (
          <div key={expense.id} className="expense-item" role="listitem">
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
                <span style={{ marginLeft: '15px', color: '#595959' }}>
                  <span role="img" aria-label="Date">📅</span> {formatDate(expense.expense_date)}
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