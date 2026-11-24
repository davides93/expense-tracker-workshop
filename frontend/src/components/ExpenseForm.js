import React, { useState } from 'react';
import { format } from 'date-fns';
import { createExpense, updateExpense } from '../utils/api';

const ExpenseForm = ({ categories, expense, onExpenseSaved }) => {
  const [formData, setFormData] = useState({
    amount: expense?.amount ?? '',
    currency: expense?.currency ?? 'EUR',
    description: expense?.description ?? '',
    expense_date: expense?.expense_date?.slice(0, 10) ?? format(new Date(), 'yyyy-MM-dd'),
    category_id: expense?.category_id ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.amount || !formData.expense_date) {
      setError('Amount and date are required');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        category_id: formData.category_id ? Number(formData.category_id) : null,
      };
      if (expense) {
        await updateExpense(expense.id, { ...payload, receipt_url: expense.receipt_url });
      } else {
        await createExpense(payload);
      }
      await onExpenseSaved(expense ? 'Expense updated.' : 'Expense added.');
    } catch (err) {
      setError(err.response?.status === 400
        ? err.response.data.error
        : 'Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{expense ? 'Edit Expense' : '➕ Add New Expense'}</h2>
        <span style={{ color: '#666', fontSize: '0.9rem' }}>
          Track your spending with detailed information
        </span>
      </div>

      {error && (
        <div className="error" role="alert">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="amount">💰 Amount *</label>
            <input
              id="amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="form-input"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max="99999999.99"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="currency">💱 Currency</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="form-select"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              {expense?.currency && !['EUR', 'USD', 'GBP'].includes(expense.currency) && (
                <option value={expense.currency}>{expense.currency}</option>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="expense_date">📅 Date *</label>
            <input
              id="expense_date"
              type="date"
              name="expense_date"
              value={formData.expense_date}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category_id">🏷️ Category</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">📝 Description</label>
          <input
            id="description"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            placeholder="What did you spend money on?"
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            type="submit"
            className="btn btn-success"
            disabled={loading}
            aria-busy={loading}
            style={{ fontSize: '1.1rem', padding: '15px 40px' }}
          >
            {loading ? 'Saving…' : expense ? 'Save Changes' : '✅ Add Expense'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
        <h4 style={{ marginBottom: '15px', color: '#333' }}>💡 Quick Tips:</h4>
        <ul style={{ color: '#666', lineHeight: '1.8' }}>
          <li>• Be specific in your descriptions for better tracking</li>
          <li>• Choose the right category to get accurate insights</li>
          <li>• Record expenses as soon as possible to avoid forgetting</li>
          <li>• Use the correct date if you're adding a past expense</li>
        </ul>
      </div>
    </div>
  );
};

export default ExpenseForm;
