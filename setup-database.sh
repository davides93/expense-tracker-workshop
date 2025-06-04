#!/bin/bash

# Expense Tracker Database Setup Script for Dev Container
# This script sets up the PostgreSQL database with schema and sample data

set -e  # Exit on any error

echo "🚀 Starting Expense Tracker Database Setup..."

# Database connection parameters
DB_HOST="postgres"
DB_PORT="5432"
DB_NAME="expense_tracker"
DB_USER="expense_user"
DB_PASSWORD="expense_password"

# Function to wait for PostgreSQL
wait_for_postgres() {
    echo "⏳ Waiting for PostgreSQL to be ready..."
    while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER 2>/dev/null; do
        echo "   PostgreSQL is unavailable - sleeping for 2 seconds..."
        sleep 2
    done
    echo "✅ PostgreSQL is ready!"
}

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    echo "📄 $description..."
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f "$file" -v ON_ERROR_STOP=1; then
        echo "✅ $description completed successfully"
    else
        echo "❌ Error running $description"
        exit 1
    fi
}

# Main execution
main() {
    wait_for_postgres
    
    echo ""
    echo "🏗️  Setting up database schema..."
    run_sql_file "01-create-schema.sql" "Database schema creation"
    
    echo ""
    echo "📊 Populating database with sample data..."
    run_sql_file "02-populate-data.sql" "Sample data insertion"
    
    echo ""
    echo "🎉 Database setup completed successfully!"
    echo ""
    echo "📋 Connection Details:"
    echo "   Host: $DB_HOST"
    echo "   Port: $DB_PORT"
    echo "   Database: $DB_NAME"
    echo "   Username: $DB_USER"
    echo "   Password: $DB_PASSWORD"
    echo ""
    echo "🔍 You can now run test queries with:"
    echo "   ./run-queries.sh"
    echo ""
    echo "🔌 Or connect directly with:"
    echo "   PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME"
}

# Check if we're in the right directory
if [[ ! -f "01-create-schema.sql" ]]; then
    echo "❌ Error: SQL files not found. Please run this script from the expense-tracker-workshop directory."
    exit 1
fi

main
