import React, { lazy, Suspense } from 'react';
import ExpensesList from '../components/ExpensesList';
import StatsCards from '../components/StatsCards';
import BudgetProgress from '../components/BudgetProgress';
import { calendarDate, dateKey } from '../utils/presentation';

const ExpenseChart = lazy(() => import('../components/ExpenseChart'));

export default function Dashboard({ expenses, stats, onAddExpense }) {
  return (
    <>
      <header className="page-heading">
        <div>
          <h1>Overview</h1>
          <p className="muted">{calendarDate(dateKey(), { month: 'long', year: 'numeric' })} · Analytics and budgets use EUR.</p>
        </div>
      </header>

      <StatsCards stats={stats} />

      <div className="dashboard-grid">
        <section className="card" aria-labelledby="analytics">
          <h2 id="analytics">Spending breakdown</h2>
          <Suspense fallback={<p className="empty" role="status">Loading charts…</p>}>
            <ExpenseChart data={stats.expensesByCategory} recentExpenses={stats.recentExpenses} />
          </Suspense>
        </section>

        <div>
          <section className="card" aria-labelledby="active-budgets">
            <div className="section-heading">
              <h2 id="active-budgets">Active budgets</h2>
              <a href="#budgets">{stats.budgetOverview.length ? 'All budgets' : 'Set a budget'}</a>
            </div>
            {stats.budgetOverview.length ? stats.budgetOverview.map(item => (
              <BudgetProgress key={item.id} name={item.category || 'Overall'} amount={item.budget_amount} spent={item.spent_amount} />
            )) : <p className="empty">No budgets are active. Set a spending limit for a category or for all expenses.</p>}
          </section>

          <section className="card" aria-labelledby="recent-expenses">
            <div className="section-heading">
              <h2 id="recent-expenses">Recent expenses</h2>
              {expenses.length > 0 && <a href="#transactions">View transactions</a>}
            </div>
            {expenses.length ? <ExpensesList expenses={expenses} /> : (
              <div className="empty">
                <p>No expenses yet.</p>
                <button className="btn btn-primary" onClick={onAddExpense}>Add your first expense</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
