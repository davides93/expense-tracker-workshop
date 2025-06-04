const db = require('./config/database');

const createTables = async () => {
  try {
    console.log('🔨 Creating expense tracker database tables...');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(7),
        icon VARCHAR(50),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Categories table created');

    // Create expenses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id),
        amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
        currency VARCHAR(3) DEFAULT 'EUR',
        description TEXT,
        expense_date DATE NOT NULL,
        receipt_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Expenses table created');

    // Create budgets table
    await db.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id),
        amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Budgets table created');

    // Create recurring_expenses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id),
        amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
        currency VARCHAR(3) DEFAULT 'EUR',
        description TEXT,
        frequency VARCHAR(20) NOT NULL,
        next_occurrence DATE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Recurring expenses table created');

    // Insert default categories
    const categoriesResult = await db.query('SELECT COUNT(*) FROM categories WHERE is_default = true');
    if (parseInt(categoriesResult.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO categories (name, color, icon, is_default) VALUES
        ('Food & Dining', '#FF6B6B', 'restaurant', TRUE),
        ('Transportation', '#4ECDC4', 'directions_car', TRUE),
        ('Shopping', '#45B7D1', 'shopping_cart', TRUE),
        ('Entertainment', '#96CEB4', 'movie', TRUE),
        ('Bills & Utilities', '#FFEAA7', 'receipt', TRUE),
        ('Healthcare', '#DDA0DD', 'local_hospital', TRUE),
        ('Travel', '#98D8C8', 'flight', TRUE),
        ('Education', '#F7DC6F', 'school', TRUE),
        ('Other', '#AED6F1', 'category', TRUE)
      `);
      console.log('✅ Default categories inserted');
    } else {
      console.log('✅ Default categories already exist');
    }

    // Create indexes
    await db.query('CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id)');
    console.log('✅ Indexes created');

    console.log('\n🎉 Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
};

createTables();