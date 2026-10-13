# AGENTS.md - Developer & Agent Instructions

Welcome to the Expense Tracker repository!

## Repository Structure
- backend/: Express.js REST API (routes for expenses, categories, budgets, stats)
- frontend/: React 18 frontend with Webpack and Chart.js
- ExpenseTracker.AppHost/: .NET Aspire orchestration service
- SQL & setup scripts: 01-create-schema.sql, setup-database.sh, etc.

## Development Commands
- Backend install & start: cd backend && npm install && node index.js
- Frontend install & start: cd frontend && npm install && npx webpack serve
- Aspire Orchestration: cd ExpenseTracker.AppHost && dotnet run

## Coding Conventions
- Use parameterized queries in Express backend to prevent SQL injection
- Use functional React components with standard hooks
- Maintain health endpoints (/health, /ready) for Aspire integration
