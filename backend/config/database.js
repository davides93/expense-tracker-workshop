const { Pool, types } = require('pg');

// PostgreSQL DATE values represent a calendar day. Serialize them at UTC
// midnight so the API preserves that day in every server timezone.
const parseDate = types.getTypeParser(types.builtins.DATE);
types.setTypeParser(types.builtins.DATE, value =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : parseDate(value)
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/expense_tracker',
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to the database:', err.stack);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
