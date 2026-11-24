const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/stats/dashboard - Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get current month expenses using index-friendly date range query
    // Performance optimization: Avoid DATE_TRUNC() on column 'expense_date' to allow PostgreSQL
    // to utilize the idx_expenses_date index scan rather than executing a full table scan.
    const currentMonthQuery = `
      SELECT 
        COUNT(*) as total_expenses,
        COALESCE(SUM(amount), 0) as total_amount
      FROM expenses 
      WHERE expense_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND expense_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        AND COALESCE(currency, 'EUR') = 'EUR'
    `;

    // Get expenses by category for current month
    // Performance optimization: Using SARGable range predicates (>= and <) enables PostgreSQL
    // index range scan on idx_expenses_date for joining expenses.
    const categoryQuery = `
      SELECT 
        c.id as category_id,
        c.name as category,
        c.color,
        COUNT(e.id) as count,
        COALESCE(SUM(e.amount), 0) as total
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id 
        AND e.expense_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND e.expense_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        AND COALESCE(e.currency, 'EUR') = 'EUR'
      GROUP BY c.id, c.name, c.color
      UNION ALL
      SELECT NULL, 'Uncategorized', '#77838d', COUNT(*), COALESCE(SUM(amount), 0)
      FROM expenses
      WHERE category_id IS NULL
        AND expense_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND expense_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        AND COALESCE(currency, 'EUR') = 'EUR'
      HAVING COUNT(*) > 0
      ORDER BY total DESC
    `;

    // Get recent expenses (last 7 days by day)
    const recentExpensesQuery = `
      SELECT 
        expense_date as date,
        COALESCE(SUM(amount), 0) as total
      FROM expenses 
      WHERE expense_date BETWEEN CURRENT_DATE - 6 AND CURRENT_DATE
        AND COALESCE(currency, 'EUR') = 'EUR'
      GROUP BY expense_date
      ORDER BY date ASC
    `;

    // Get budget vs actual spending
    const budgetQuery = `
      SELECT 
        b.id,
        b.amount as budget_amount,
        c.name as category,
        c.color,
        COALESCE(spent.total, 0) as spent_amount,
        CASE 
          WHEN b.amount > 0 THEN (COALESCE(spent.total, 0) / b.amount * 100)
          ELSE 0 
        END as percentage_used
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN LATERAL (
        SELECT SUM(e.amount) AS total
        FROM expenses e
        WHERE e.expense_date BETWEEN b.period_start AND b.period_end
          AND (b.category_id IS NULL OR e.category_id = b.category_id)
          AND (b.user_id IS NULL OR e.user_id = b.user_id)
          AND COALESCE(e.currency, 'EUR') = 'EUR'
      ) spent ON true
      WHERE b.period_start <= CURRENT_DATE AND b.period_end >= CURRENT_DATE
    `;

    const [currentMonth, categories, recentExpenses, budgets] = await Promise.all([
      db.query(currentMonthQuery),
      db.query(categoryQuery),
      db.query(recentExpensesQuery),
      db.query(budgetQuery)
    ]);

    res.json({
      currentMonth: currentMonth.rows[0],
      expensesByCategory: categories.rows,
      recentExpenses: recentExpenses.rows,
      budgetOverview: budgets.rows
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET /api/stats/monthly - Get monthly expense trends
router.get('/monthly', async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_TRUNC('month', expense_date)::date as month,
        COALESCE(SUM(amount), 0) as total,
        COUNT(*) as count
      FROM expenses 
      WHERE expense_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
        AND expense_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        AND COALESCE(currency, 'EUR') = 'EUR'
      GROUP BY DATE_TRUNC('month', expense_date)
      ORDER BY month ASC
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching monthly stats:', err);
    res.status(500).json({ error: 'Failed to fetch monthly statistics' });
  }
});

module.exports = router;
