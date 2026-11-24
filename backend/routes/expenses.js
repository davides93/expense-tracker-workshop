const express = require('express');
const router = express.Router();
const db = require('../config/database');

const MAX_ID = 2147483647;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function integer(value) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+$/.test(value))) {
    return NaN;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : NaN;
}

function validId(value) {
  const id = integer(value);
  return id > 0 && id <= MAX_ID;
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) {
    return false;
  }
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validReceiptUrl(value) {
  if (value == null || value === '') return true;
  if (typeof value !== 'string' || value.length > 500 || !/^https?:\/\//i.test(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateExpense(body) {
  const { amount, currency, description, expense_date, category_id, receipt_url } = body;
  const numericAmount = Number(amount);
  if ((typeof amount !== 'number' && typeof amount !== 'string') ||
      !Number.isFinite(numericAmount) || numericAmount < 0.01 || numericAmount > 99999999.99) {
    return 'Amount must be between 0.01 and 99999999.99';
  }
  if (!validDate(expense_date)) return 'A valid expense_date (YYYY-MM-DD) is required';
  if (currency != null && (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency))) {
    return 'Currency must be a three-letter code';
  }
  if (description != null && typeof description !== 'string') return 'Description must be text';
  if (category_id != null && category_id !== '' && !validId(category_id)) return 'Invalid category ID';
  if (!validReceiptUrl(receipt_url)) return 'Receipt URL must be a valid HTTP or HTTPS URL';
  return null;
}

// GET /api/expenses - List expenses
router.get('/', async (req, res) => {
  try {
    const { category_id, start_date, end_date } = req.query;
    const rawLimit = integer(req.query.limit);
    const rawOffset = integer(req.query.offset);
    const limit = rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;
    const offset = rawOffset >= 0 ? Math.min(rawOffset, MAX_ID) : 0;
    if (category_id !== undefined && !validId(category_id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    if ((start_date !== undefined && !validDate(start_date)) ||
        (end_date !== undefined && !validDate(end_date)) ||
        (start_date && end_date && start_date > end_date)) {
      return res.status(400).json({ error: 'Invalid date range' });
    }

    let query = `
      SELECT e.*, c.name as category_name, c.color as category_color 
      FROM expenses e 
      LEFT JOIN categories c ON e.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (category_id) {
      paramCount++;
      query += ` AND e.category_id = $${paramCount}`;
      params.push(category_id);
    }

    if (start_date) {
      paramCount++;
      query += ` AND e.expense_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND e.expense_date <= $${paramCount}`;
      params.push(end_date);
    }

    query += ` ORDER BY e.expense_date DESC, e.created_at DESC, e.id DESC`;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit + 1);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await db.query(query, params);
    res.json({
      expenses: result.rows.slice(0, limit),
      total: Math.min(result.rows.length, limit),
      limit,
      offset,
      hasMore: result.rows.length > limit
    });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST /api/expenses - Create a new expense
router.post('/', async (req, res) => {
  try {
    const { amount, currency, description, expense_date, category_id, receipt_url } = req.body;
    
    const validationError = validateExpense(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const query = `
      INSERT INTO expenses (amount, currency, description, expense_date, category_id, receipt_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      Number(amount), currency || 'EUR', description, expense_date, category_id || null, receipt_url || null
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Category does not exist' });
    console.error('Error creating expense:', err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// PUT /api/expenses/:id - Update an expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ error: 'Invalid expense ID' });
    const { amount, currency, description, expense_date, category_id, receipt_url } = req.body;
    const validationError = validateExpense(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    
    const query = `
      UPDATE expenses 
      SET amount = $1, currency = $2, description = $3, expense_date = $4, 
          category_id = $5, receipt_url = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const result = await db.query(query, [
      Number(amount), currency || 'EUR', description, expense_date, category_id || null, receipt_url || null, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Category does not exist' });
    console.error('Error updating expense:', err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ error: 'Invalid expense ID' });
    
    const result = await db.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
