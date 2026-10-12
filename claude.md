# Expense Tracker - Claude AI Assistant Guide

This document provides project information, architecture guidelines, and common commands for Claude AI assistant working on the Expense Tracker codebase.

---

## 📌 Project Overview

Expense Tracker is a full-stack web application designed for personal and business expense tracking, budgeting, and financial analytics.

### Key Features
- **Expense Management**: Log, view, update, and delete expenses with category tagging.
- **Budgeting**: Set and monitor category-based budgets.
- **Analytics & Stats**: Visual dashboards with expense distribution and monthly trends using Chart.js.
- **Service Orchestration**: Managed via .NET Aspire for centralized logging, service discovery, and monitoring.

---

## 🏗️ Tech Stack & Architecture

- **Frontend**: React 18, Webpack 5, Babel, Chart.js, React Router v6, CSS Modules / Flexbox/Grid
- **Backend**: Node.js, Express.js, PostgreSQL (`pg` driver), `dotenv`, `cors`
- **Orchestration**: .NET 8 / .NET Aspire (`ExpenseTracker.AppHost`)
- **Database**: PostgreSQL (SQL schema and seed scripts in root directory)

---

## 🚀 Common Commands

### 1. Installation
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install
```

### 2. Running Services

#### Via .NET Aspire (Recommended Orchestration)
```bash
cd ExpenseTracker.AppHost
dotnet run
```

#### Manual Run (Standalone)
```bash
# Backend (http://localhost:3001)
cd backend
npm start &

# Frontend (http://localhost:3000)
cd frontend
npm start &
```

### 3. Database Setup & Management
```bash
# Standard DB Setup
./setup-database.sh

# Retail Exact Schema Setup
./setup-retail-exact.sh

# Docker Standalone DB
docker-compose -f docker-compose.standalone.yml up -d
```

---

## 🌐 API Endpoints

- **Health Checks**:
  - `GET /health` - Database & service health status
  - `GET /ready` - Service readiness probe
- **Expenses**: `/api/expenses` (GET, POST, PUT, DELETE)
- **Categories**: `/api/categories` (GET, POST, PUT, DELETE)
- **Budgets**: `/api/budgets` (GET, POST, PUT, DELETE)
- **Statistics**: `/api/stats` (GET summary, charts, category totals)

---

## 🎨 Code Conventions & Best Practices

1. **Backend (Express/Node.js)**:
   - Modular routing in `backend/routes/`.
   - Centralized database client in `backend/config/database.js`.
   - Always sanitize SQL queries using parameterized queries (`$1`, `$2`, etc.).
   - Standard HTTP status code responses (`200`, `201`, `400`, `404`, `500`).

2. **Frontend (React)**:
   - Functional components with React Hooks.
   - Page views under `frontend/src/pages/` and reusable UI elements under `frontend/src/components/`.
   - Centralized API utilities/helpers in `frontend/src/utils/`.

3. **Database**:
   - PostgreSQL schema definitions (`01-create-schema.sql`, `01-create-schema-retail.sql`).
   - Use standard snake_case naming for tables and columns in SQL files.
