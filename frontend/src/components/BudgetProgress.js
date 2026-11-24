import React from 'react';
import { currency } from '../utils/presentation';

export default function BudgetProgress({ name, amount, spent, period }) {
  const percentage = Number(amount) > 0 ? (Number(spent) / Number(amount)) * 100 : 0;
  const value = Math.min(100, Math.max(0, percentage));
  const status = percentage >= 100 ? 'Limit reached' : percentage >= 80 ? 'Near limit' : 'On track';

  return (
    <div className="budget-item">
      <div className="section-heading">
        <div><h3>{name}</h3>{period && <p className="muted">{period}</p>}</div>
        <span className={'budget-status ' + (percentage >= 100 ? 'over' : percentage >= 80 ? 'near' : '')}>
          {status}
        </span>
      </div>
      <div className="budget-track" role="progressbar" aria-label={name + ' budget used'}
        aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-valuetext={percentage.toFixed(1) + '% used'}>
        <span style={{ width: value + '%' }} className={percentage >= 100 ? 'over' : percentage >= 80 ? 'near' : ''} />
      </div>
      <p className="budget-caption">
        <span>{currency(spent)} of {currency(amount)}</span><span>{percentage.toFixed(0)}%</span>
      </p>
    </div>
  );
}
