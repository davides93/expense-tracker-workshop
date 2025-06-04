# Expense Tracker Database Setup Guide

This guide provides multiple ways to set up the PostgreSQL database for the Expense Tracker application.

## 🐳 Dev Container Setup (Recommended)

The easiest way to run this database is using the provided dev container configuration.

### Prerequisites
- Visual Studio Code
- Docker Desktop
- Dev Containers extension for VS Code

### Quick Start

1. **Open in Dev Container**
   - Open this folder in VS Code
   - When prompted, click "Reopen in Container" (or use Command Palette: "Dev Containers: Reopen in Container")
   - The container will automatically build and start PostgreSQL

2. **Database Auto-Setup**
   - The database will be automatically created and populated with sample data
   - Connection details:
     - Host: `postgres`
     - Port: `5432`
     - Database: `expense_tracker`
     - Username: `expense_user`
     - Password: `expense_password`

3. **Run Scripts**
   ```bash
   # Setup database (if needed)
   ./setup-database.sh
   
   # Run test queries interactively
   ./run-queries.sh
   
   # Connect directly to database
   PGPASSWORD=expense_password psql -h postgres -U expense_user -d expense_tracker
   ```

4. **VS Code Tasks**
   - Use `Ctrl+Shift+P` → "Tasks: Run Task" to access predefined database tasks
   - Available tasks: Setup Database, Populate Database, Run Test Queries, Connect to Database, Reset Database

---

# PostgreSQL Setup Guide for Expense Tracker Database

## Prerequisites

### Option 1: Install PostgreSQL Locally (Recommended for Development)

#### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create your user database (optional)
createdb $(whoami)

# Access PostgreSQL
psql postgres
```

#### Alternative: PostgreSQL.app for macOS
1. Download from https://postgresapp.com/
2. Install and start the application
3. Click "Initialize" to create a new server
4. Open Terminal and run: `psql`

#### Linux (Ubuntu/Debian)
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database
sudo -u postgres psql
```

#### Windows
1. Download from https://www.postgresql.org/download/windows/
2. Run the installer
3. Set password for postgres user
4. Start pgAdmin or use command line

### Option 2: Use Docker (Quick Setup)
```bash
# Run PostgreSQL in Docker
docker run --name expense-tracker-db \
  -e POSTGRES_DB=expense_tracker \
  -e POSTGRES_USER=expense_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15

# Connect to the database
docker exec -it expense-tracker-db psql -U expense_user -d expense_tracker
```

### Option 3: Cloud Database
- **AWS RDS**: Create a PostgreSQL instance
- **Google Cloud SQL**: Set up PostgreSQL database
- **Azure Database**: Create PostgreSQL flexible server
- **Heroku Postgres**: Add Heroku Postgres addon

## Database Setup Steps

### 1. Create the Database
```sql
-- Connect as superuser (postgres) first
psql postgres

-- Create database
CREATE DATABASE expense_tracker
    WITH ENCODING 'UTF8'
    LC_COLLATE 'en_US.UTF-8'
    LC_CTYPE 'en_US.UTF-8'
    TEMPLATE template0;

-- Create user (optional, for security)
CREATE USER expense_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO expense_user;

-- Connect to the new database
\c expense_tracker

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO expense_user;
```

### 2. Run the Schema Creation Script
```bash
# From your project directory
psql -d expense_tracker -f 01-create-schema.sql
```

### 3. Populate with Sample Data
```bash
# Run the data population script
psql -d expense_tracker -f 02-populate-data.sql
```

### 4. Test with Sample Queries
```bash
# Run some test queries
psql -d expense_tracker -f 03-useful-queries.sql
```

## Verification Steps

### 1. Check Tables Are Created
```sql
\c expense_tracker
\dt

-- Expected output should show:
-- attachments, budget_alerts, budgets, categories, currencies, 
-- exchange_rates, expenses, recurring_expenses, users
```

### 2. Verify Sample Data
```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check expense count
SELECT COUNT(*) FROM expenses;

-- Check categories
SELECT name, is_default FROM categories WHERE is_default = true;
```

### 3. Test a Complex Query
```sql
-- Monthly expense summary
SELECT * FROM monthly_expense_summary LIMIT 10;

-- Budget vs actual
SELECT * FROM budget_vs_actual;
```

## Connection Information

### Local Connection
- **Host**: localhost (or 127.0.0.1)
- **Port**: 5432 (default)
- **Database**: expense_tracker
- **Username**: expense_user (or postgres)
- **Password**: [your_password]

### Connection String Examples
```bash
# psql command line
psql "postgresql://expense_user:your_password@localhost:5432/expense_tracker"

# Python (using psycopg2)
conn = psycopg2.connect(
    host="localhost",
    database="expense_tracker",
    user="expense_user",
    password="your_password",
    port="5432"
)

# Node.js (using pg)
const pool = new Pool({
  user: 'expense_user',
  host: 'localhost',
  database: 'expense_tracker',
  password: 'your_password',
  port: 5432,
});

# Java (JDBC)
jdbc:postgresql://localhost:5432/expense_tracker?user=expense_user&password=your_password
```

## Useful PostgreSQL Commands

### Basic Navigation
```sql
\l                    -- List all databases
\c database_name      -- Connect to database
\dt                   -- List tables
\d table_name         -- Describe table structure
\di                   -- List indexes
\df                   -- List functions
\dv                   -- List views
\q                    -- Quit psql
```

### Database Information
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('expense_tracker'));

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'expense_tracker';
```

## Performance Configuration

### Basic Performance Settings (add to postgresql.conf)
```conf
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB

# Query planner
random_page_cost = 1.1
effective_io_concurrency = 200
```

### Useful Indexes for Performance
The schema already includes the most important indexes, but you can add more based on your queries:

```sql
-- Additional indexes for specific use cases
CREATE INDEX idx_expenses_user_amount ON expenses(user_id, amount_in_base_currency DESC);
CREATE INDEX idx_expenses_merchant ON expenses(merchant) WHERE merchant IS NOT NULL;
CREATE INDEX idx_expenses_tags ON expenses USING gin(tags) WHERE tags IS NOT NULL;
```

## Backup and Restore

### Create Backup
```bash
# Full database backup
pg_dump -h localhost -U expense_user -d expense_tracker > expense_tracker_backup.sql

# Data-only backup
pg_dump -h localhost -U expense_user -d expense_tracker --data-only > expense_tracker_data.sql

# Schema-only backup
pg_dump -h localhost -U expense_user -d expense_tracker --schema-only > expense_tracker_schema.sql
```

### Restore Database
```bash
# Restore full database
psql -h localhost -U expense_user -d expense_tracker < expense_tracker_backup.sql

# Restore to new database
createdb expense_tracker_restored
psql -h localhost -U expense_user -d expense_tracker_restored < expense_tracker_backup.sql
```

## Security Best Practices

### 1. User Management
```sql
-- Create read-only user for reporting
CREATE USER report_user WITH PASSWORD 'report_password';
GRANT CONNECT ON DATABASE expense_tracker TO report_user;
GRANT USAGE ON SCHEMA public TO report_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO report_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO report_user;

-- Create application user with limited permissions
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE expense_tracker TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

### 2. Row Level Security (RLS) Example
```sql
-- Enable RLS on sensitive tables
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for user data isolation
CREATE POLICY user_expenses_policy ON expenses
    FOR ALL TO app_user
    USING (user_id = current_setting('app.current_user_id')::uuid);
```

### 3. Connection Security
- Use SSL connections in production
- Restrict access by IP address in pg_hba.conf
- Use connection pooling (PgBouncer)
- Regular security updates

## Monitoring and Maintenance

### 1. Database Statistics
```sql
-- Table statistics
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

### 2. Maintenance Tasks
```sql
-- Update table statistics
ANALYZE;

-- Vacuum to reclaim space
VACUUM;

-- Reindex if needed
REINDEX INDEX idx_expenses_user_date;
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if PostgreSQL is running: `brew services list | grep postgresql`
   - Check port: `lsof -i :5432`

2. **Permission Denied**
   - Verify user permissions
   - Check pg_hba.conf configuration

3. **Database Does Not Exist**
   - Create database first: `createdb expense_tracker`

4. **Performance Issues**
   - Run EXPLAIN ANALYZE on slow queries
   - Check if indexes are being used
   - Update table statistics with ANALYZE

### Logs Location
- **macOS (Homebrew)**: `/opt/homebrew/var/log/postgresql@15.log`
- **Linux**: `/var/log/postgresql/`
- **Docker**: `docker logs expense-tracker-db`

## Next Steps

1. Set up your application to connect to the database
2. Implement authentication and authorization
3. Add database connection pooling
4. Set up monitoring and alerting
5. Plan for backup and disaster recovery
6. Consider read replicas for scaling

The database is now ready for your expense tracker application development!
