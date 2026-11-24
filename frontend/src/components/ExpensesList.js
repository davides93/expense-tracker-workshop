import React from 'react';
import { calendarDate, currency } from '../utils/presentation';

function safeReceipt(url) {
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return null;
  try {
    return new URL(url).href;
  } catch {
    return null;
  }
}

export default function ExpensesList({ expenses, onEdit, onDelete, busy = false }) {
  return (
    <ul className="expense-list" aria-label={onEdit ? 'Transactions' : 'Recent expenses'}>
      {expenses.map(expense => {
        const description = expense.description || 'Untitled expense';
        const receipt = safeReceipt(expense.receipt_url);
        return (
          <li key={expense.id} className="expense-item">
            <div className="expense-info">
              <strong>{description}</strong>
              <div className="expense-meta">
                <span>{expense.category_name || 'Uncategorized'}</span>
                <time dateTime={expense.expense_date.slice(0, 10)}>{calendarDate(expense.expense_date)}</time>
                {receipt && <a href={receipt} target="_blank" rel="noreferrer">Receipt</a>}
              </div>
            </div>
            <span className="expense-amount">{currency(expense.amount, expense.currency || 'EUR')}</span>
            {onEdit && (
              <div className="actions expense-actions">
                <button className="btn btn-secondary" onClick={() => onEdit(expense)}
                  aria-label={'Edit ' + description} disabled={busy}>Edit</button>
                <button className="btn btn-danger" onClick={() => onDelete(expense)}
                  aria-label={'Delete ' + description} disabled={busy}>Delete</button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
