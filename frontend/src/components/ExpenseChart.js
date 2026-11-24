import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Filler, ArcElement, Tooltip,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { calendarDate, currency, dateKey } from '../utils/presentation';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, ArcElement, Tooltip);

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    tooltip: {
      callbacks: { label: context => currency(context.raw) },
    },
  },
};

const lineOptions = {
  ...commonOptions,
  scales: {
    y: { beginAtZero: true, ticks: { callback: value => currency(value) } },
    x: { grid: { display: false } },
  },
};

function ExpenseChart({ data, recentExpenses }) {
  const categories = useMemo(() => data.filter(row => Number(row.total) > 0), [data]);
  const days = useMemo(() => {
    const now = new Date();
    const byDate = new Map(recentExpenses.map(item => [item.date.slice(0, 10), Number(item.total)]));
    return Array.from({ length: 7 }, (_, index) => {
      const date = dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + index));
      return { date, total: byDate.get(date) || 0 };
    });
  }, [recentExpenses]);
  const doughnut = useMemo(() => ({
    labels: categories.map(row => row.category),
    datasets: [{
      data: categories.map(row => Number(row.total)),
      backgroundColor: categories.map(row => row.color || '#14785f'),
      borderColor: '#fff',
      borderWidth: 2,
    }],
  }), [categories]);
  const trend = useMemo(() => ({
    labels: days.map(day => calendarDate(day.date, { day: 'numeric', month: 'short' })),
    datasets: [{
      data: days.map(day => day.total),
      borderColor: '#14785f',
      backgroundColor: '#e0f2ea',
      fill: true,
      tension: 0.25,
    }],
  }), [days]);

  if (!categories.length && !days.some(day => day.total)) {
    return <p className="empty">No EUR spending to chart yet.</p>;
  }

  return (
    <div className="charts">
      {categories.length > 0 && (
        <div>
          <h3>This month by category</h3>
          <div className="chart-canvas">
            <Doughnut role="img" aria-label="Current month spending by category" data={doughnut} options={commonOptions} />
          </div>
          <ul className="category-list chart-legend">
            {categories.map(row => (
              <li key={row.category_id ?? "uncategorized"}>
                <span className="color-dot" aria-hidden="true" style={{ backgroundColor: row.color || '#14785f' }} />
                <span>{row.category}</span><strong>{currency(row.total)}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
      {days.some(day => day.total) && (
        <div>
          <h3>Last 7 days</h3>
          <div className="chart-canvas">
            <Line role="img" aria-label="Daily spending over the last seven days" data={trend} options={lineOptions} />
          </div>
          <details>
            <summary>Show daily amounts</summary>
            <ul className="category-list chart-legend">
              {days.map(day => <li key={day.date}><span>{calendarDate(day.date, { day: 'numeric', month: 'short' })}</span><strong>{currency(day.total)}</strong></li>)}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}

export default React.memo(ExpenseChart);
