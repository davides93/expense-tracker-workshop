const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validDate, validId } = require('../utils/validation');

function validateBudget({ amount, category_id, period_start, period_end }) {
  const value = Number(amount);
  if ((typeof amount !== 'string' && typeof amount !== 'number') ||
      !Number.isFinite(value) || value < 0.01 || value > 99999999.99) {
    return 'Enter a budget amount between 0.01 and 99999999.99';
  }
  if (!validDate(period_start) || !validDate(period_end) || period_start > period_end) {
    return 'Enter a valid date range';
  }
  if (category_id != null && category_id !== '' && !validId(category_id)) return 'Invalid category ID';
  return null;
}

// GET /api/budgets - Get all budgets
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT b.*, c.name as category_name, c.color as category_color,
             COALESCE(spent.total, 0) as spent_amount
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
      ORDER BY b.period_start DESC, b.id DESC
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.post('/', async (req, res) => {
  const payload = req.body || {};
  const error = validateBudget(payload);
  if (error) return res.status(400).json({ error });
  const { amount, category_id, period_start, period_end, user_id } = payload;
  if (user_id != null && !validId(user_id)) return res.status(400).json({ error: 'Invalid user ID' });

  try {
    const result = await db.query(
      `INSERT INTO budgets (amount, category_id, period_start, period_end, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [Number(amount), category_id || null, period_start, period_end, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Category or user does not exist' });
    console.error('Error creating budget:', err);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) return res.status(400).json({ error: 'Invalid budget ID' });
  const payload = req.body || {};
  const error = validateBudget(payload);
  if (error) return res.status(400).json({ error });
  const { amount, category_id, period_start, period_end } = payload;

  try {
    const result = await db.query(
      `UPDATE budgets SET amount = $1, category_id = $2, period_start = $3, period_end = $4
       WHERE id = $5 RETURNING *`,
      [Number(amount), category_id || null, period_start, period_end, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Budget not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Category does not exist' });
    console.error('Error updating budget:', err);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) return res.status(400).json({ error: 'Invalid budget ID' });
  try {
    const result = await db.query('DELETE FROM budgets WHERE id = $1', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Budget not found' });
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting budget:', err);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

module.exports = router;
