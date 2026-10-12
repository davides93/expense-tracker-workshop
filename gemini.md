# Expense Tracker - Gemini AI Guide

This document outlines context, tech stack, and execution flow for Gemini AI assistant.

## 🚀 Tech Stack Summary
- Frontend: React 18, Webpack 5, Chart.js, React Router v6
- Backend: Node.js, Express, PostgreSQL (pg driver)
- Service Orchestration: .NET 8 / .NET Aspire AppHost

## 🛠️ Architecture & Workflows
- Backend API routes in backend/routes/ (expenses, categories, budgets, stats)
- React single-page UI components in frontend/src/components/ and pages in frontend/src/pages/
- Aspire AppHost binds Express API on port 3001 and React frontend on port 3000

## ⚙️ Quick Development Reference
- Backend setup: cd backend && npm install
- Frontend setup: cd frontend && npm install
- Run via Aspire: cd ExpenseTracker.AppHost && dotnet run
- Database setup: ./setup-database.sh or docker-compose up -d
