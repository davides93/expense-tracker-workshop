const db = require('./config/database');

const addSampleData = async () => {
  try {
    console.log('🎯 Adding sample expense data...');

    // Check if we already have sample data
    const existingExpenses = await db.query('SELECT COUNT(*) FROM expenses');
    if (parseInt(existingExpenses.rows[0].count) > 0) {
      console.log('✅ Sample data already exists');
      return;
    }

    // Get categories
    const categoriesResult = await db.query('SELECT id, name FROM categories ORDER BY id');
    const categories = categoriesResult.rows;

    if (categories.length === 0) {
      console.log('❌ No categories found. Run setup-db.js first.');
      return;
    }

    // Sample expenses data
    const sampleExpenses = [
      {
        amount: 45.50,
        currency: 'EUR',
        description: 'Grocery shopping at Supermarket',
        expense_date: '2025-06-04',
        category_id: categories.find(c => c.name === 'Food & Dining')?.id || 1
      },
      {
        amount: 12.80,
        currency: 'EUR',
        description: 'Coffee and pastry',
        expense_date: '2025-06-03',
        category_id: categories.find(c => c.name === 'Food & Dining')?.id || 1
      },
      {
        amount: 89.99,
        currency: 'EUR',
        description: 'Monthly gym membership',
        expense_date: '2025-06-02',
        category_id: categories.find(c => c.name === 'Healthcare')?.id || 6
      },
      {
        amount: 25.00,
        currency: 'EUR',
        description: 'Taxi to airport',
        expense_date: '2025-06-01',
        category_id: categories.find(c => c.name === 'Transportation')?.id || 2
      },
      {
        amount: 156.75,
        currency: 'EUR',
        description: 'New running shoes',
        expense_date: '2025-05-31',
        category_id: categories.find(c => c.name === 'Shopping')?.id || 3
      },
      {
        amount: 28.50,
        currency: 'EUR',
        description: 'Movie tickets',
        expense_date: '2025-05-30',
        category_id: categories.find(c => c.name === 'Entertainment')?.id || 4
      },
      {
        amount: 120.00,
        currency: 'EUR',
        description: 'Monthly internet bill',
        expense_date: '2025-05-29',
        category_id: categories.find(c => c.name === 'Bills & Utilities')?.id || 5
      },
      {
        amount: 67.30,
        currency: 'EUR',
        description: 'Gas station fill-up',
        expense_date: '2025-05-28',
        category_id: categories.find(c => c.name === 'Transportation')?.id || 2
      },
      {
        amount: 15.95,
        currency: 'EUR',
        description: 'Online course subscription',
        expense_date: '2025-05-27',
        category_id: categories.find(c => c.name === 'Education')?.id || 8
      },
      {
        amount: 234.60,
        currency: 'EUR',
        description: 'Weekend trip accommodation',
        expense_date: '2025-05-26',
        category_id: categories.find(c => c.name === 'Travel')?.id || 7
      }
    ];

    // Insert sample expenses
    for (const expense of sampleExpenses) {
      await db.query(`
        INSERT INTO expenses (amount, currency, description, expense_date, category_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [expense.amount, expense.currency, expense.description, expense.expense_date, expense.category_id]);
    }

    console.log(`✅ Added ${sampleExpenses.length} sample expenses`);

    // Add sample budgets
    const sampleBudgets = [
      {
        amount: 300.00,
        category_id: categories.find(c => c.name === 'Food & Dining')?.id || 1,
        period_start: '2025-06-01',
        period_end: '2025-06-30'
      },
      {
        amount: 150.00,
        category_id: categories.find(c => c.name === 'Transportation')?.id || 2,
        period_start: '2025-06-01',
        period_end: '2025-06-30'
      },
      {
        amount: 200.00,
        category_id: categories.find(c => c.name === 'Entertainment')?.id || 4,
        period_start: '2025-06-01',
        period_end: '2025-06-30'
      }
    ];

    for (const budget of sampleBudgets) {
      await db.query(`
        INSERT INTO budgets (amount, category_id, period_start, period_end)
        VALUES ($1, $2, $3, $4)
      `, [budget.amount, budget.category_id, budget.period_start, budget.period_end]);
    }

    console.log(`✅ Added ${sampleBudgets.length} sample budgets`);
    console.log('\n🎉 Sample data setup completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    process.exit(1);
  }
};

addSampleData();