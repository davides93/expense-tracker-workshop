#!/bin/bash
# filepath: /Users/davidesantoro/Visual Studio Code/expense-tracker-workshop/run-queries-exact.sh
# Query runner for Retail Database - Exact Schema Match
# Created: 2025-06-04

set -e

# Database connection details
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="expense_tracker"
DB_USER="expense_user"
DB_PASSWORD="expense_password"

# Define PGPASSWORD to avoid password prompts
export PGPASSWORD=$DB_PASSWORD

echo "🔍 Running queries on Retail Database (Exact Schema)..."
echo "======================================================"

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "03-useful-queries-retail-exact.sql"
