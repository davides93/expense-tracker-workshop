import React, { useState } from 'react';
import { createExpense } from '../utils/api';

const ExpenseForm = ({ categories, onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'EUR',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    category_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      
      await createExpense({
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      });
      
      setSuccess(true);
      setFormData({
        amount: '',
        currency: 'EUR',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        category_id: '',
      });
      
      // Call parent callback
      if (onExpenseAdded) {
        setTimeout(() => {
          onExpenseAdded();
        }, 1500);
      }
      
    } catch (err) {
      setError('Failed to add expense. Please try again.');
      console.error('Error creating expense:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#27ae60', marginBottom: '10px' }}>Expense Added Successfully!</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Your expense has been recorded and will appear in your dashboard.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => setSuccess(false)}
          >
            Add Another Expense
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">➕ Add New Expense</h2>
        <span style={{ color: '#666', fontSize: '0.9rem' }}>
          Track your spending with detailed information
        </span>
      </div>

      {error && (
        <div className="error">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">💰 Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="form-input"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">💱 Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="form-select"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">📅 Date *</label>
            <input
              type="date"
              name="expense_date"
              value={formData.expense_date}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">🏷️ Category</label>
            <select
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
          <label className="form-label">📝 Description</label>
          <input
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
            style={{ fontSize: '1.1rem', padding: '15px 40px' }}
          >
            {loading ? '⏳ Adding...' : '✅ Add Expense'}
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