#!/bin/bash
# filepath: /Users/davidesantoro/Visual Studio Code/expense-tracker-workshop/setup-retail-exact.sh
# Setup script for Retail Database - Exact Schema Match
# Created: 2025-06-04

set -e

echo "🗄️  Setting up Retail Database (Exact Schema Match)..."
echo "=============================================="

# Database connection details
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="expense_tracker"
DB_USER="expense_user"
DB_PASSWORD="expense_password"

# Define PGPASSWORD to avoid password prompts
export PGPASSWORD=$DB_PASSWORD

echo "📋 Step 1: Creating database schema..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "01-create-schema-retail-exact.sql"

echo "📊 Step 2: Populating with sample data..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "02-populate-data-retail-exact.sql"

echo "✅ Database setup completed successfully!"
echo ""
echo "🔍 Database Information:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USER"
echo ""
echo "📊 Tables created:"
echo "  - Customers (customerID, firstName, lastName, birthDate, moneySpent, anniversary)"
echo "  - Employees (employeeID, firstName, lastName, birthDate)"
echo "  - Products (productID, category, price)"
echo "  - Orders (orderID, customerID, employeeID, productID, orderTotal, orderDate)"
echo ""
echo "🎯 To run sample queries:"
echo "  ./run-queries-exact.sh"
echo "  or: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 03-useful-queries-retail-exact.sql"
