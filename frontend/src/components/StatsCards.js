import React from 'react';
import { currency } from '../utils/presentation';

export default function StatsCards({ stats }) {
  const month = stats.currentMonth;
  const count = Number(month.total_expenses);
  const entries = [
    ['Spent this month', currency(month.total_amount)],
    ['Transactions', count],
    ['Average expense', currency(count ? month.total_amount / count : 0)],
    ['Categories used', stats.expensesByCategory.filter(category => category.category_id && Number(category.count) > 0).length],
  ];
  return (
    <dl className="stats-grid">
      {entries.map(([label, value]) => (
        <div key={label} className="card stat-card">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
