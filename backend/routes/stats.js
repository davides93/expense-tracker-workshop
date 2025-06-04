const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/stats/dashboard - Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get current month expenses
    const currentMonthQuery = `
      SELECT 
        COUNT(*) as total_expenses,
        COALESCE(SUM(amount), 0) as total_amount
      FROM expenses 
      WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)
    `;

    // Get expenses by category for current month
    const categoryQuery = `
      SELECT 
        c.name as category,
        c.color,
        COUNT(e.id) as count,
        COALESCE(SUM(e.amount), 0) as total
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id 
        AND DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY c.id, c.name, c.color
      ORDER BY total DESC
    `;

    // Get recent expenses (last 7 days by day)
    const recentExpensesQuery = `
      SELECT 
        DATE(expense_date) as date,
        COALESCE(SUM(amount), 0) as total
      FROM expenses 
      WHERE expense_date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(expense_date)
      ORDER BY date ASC
    `;

    // Get budget vs actual spending
    const budgetQuery = `
      SELECT 
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
      LEFT JOIN (
        SELECT 
          category_id, 
          SUM(amount) as total
        FROM expenses 
        WHERE expense_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY category_id
      ) spent ON b.category_id = spent.category_id
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
        DATE_TRUNC('month', expense_date) as month,
        COALESCE(SUM(amount), 0) as total,
        COUNT(*) as count
      FROM expenses 
      WHERE expense_date >= CURRENT_DATE - INTERVAL '12 months'
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