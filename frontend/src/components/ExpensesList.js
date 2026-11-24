import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';

const FALLBACK_CATEGORY = { name: 'Other', color: '#AED6F1' };

const ExpensesList = ({
  expenses, categories, showAll = false, onAddExpense, onEditExpense, onDeleteExpense, actionsDisabled,
}) => {
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
        <p style={{ marginBottom: '15px' }}>Start by adding your first expense!</p>
        {onAddExpense && (
          <button className="btn btn-primary" onClick={onAddExpense}>
            ➕ Add Your First Expense
          </button>
        )}
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString.slice(0, 10)), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const displayExpenses = showAll ? expenses : expenses.slice(0, 5);

  return (
    <div className="expenses-list" role="list" aria-label={showAll ? "All expenses" : "Recent expenses"}>
      {displayExpenses.map((expense) => {
        const category = categoryMap.get(expense.category_id) || FALLBACK_CATEGORY;
        
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
                  <span aria-hidden="true">📅</span> {formatDate(expense.expense_date)}
                </span>
              </div>
            </div>
            <div className="expense-amount">
              {new Intl.NumberFormat('en', { style: 'currency', currency: expense.currency || 'EUR' })
                .format(Number(expense.amount))}
            </div>
            {onEditExpense && onDeleteExpense && (
              <div className="expense-actions">
                <button className="btn btn-warning" onClick={() => onEditExpense(expense)} disabled={actionsDisabled}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => onDeleteExpense(expense)} disabled={actionsDisabled}>
                  Delete
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(ExpensesList);
