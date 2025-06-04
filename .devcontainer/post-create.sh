#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U expense_user; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing setup"

# Run the database setup scripts
echo "Creating database schema..."
psql -h postgres -U expense_user -d expense_tracker -f /workspaces/expense-tracker-workshop/01-create-schema.sql

echo "Populating database with sample data..."
psql -h postgres -U expense_user -d expense_tracker -f /workspaces/expense-tracker-workshop/02-populate-data.sql

echo "Database setup completed successfully!"
echo "You can now connect to the database using:"
echo "  Host: postgres"
echo "  Port: 5432"
echo "  Database: expense_tracker"
echo "  Username: expense_user"
echo "  Password: expense_password"
