# Expense Tracker

A modern expense tracking application built with React frontend and Node.js backend, with .NET Aspire for orchestration and monitoring.

## 🚀 Quick Start with Aspire

The recommended way to run the application is using .NET Aspire, which provides service orchestration, monitoring, and health checks.

### Prerequisites

- .NET 8.0 SDK
- Node.js 18+ and npm
- .NET Aspire workload

### Install Aspire Workload

```bash
dotnet workload install aspire
```

### Run with Aspire

Initialize PostgreSQL with the database steps below before starting Aspire.

1. Install dependencies for both frontend and backend:
```bash
# Backend dependencies
cd backend && npm install && cd ..

# Frontend dependencies  
cd frontend && npm install && cd ..
```

2. Start the application with Aspire:
```bash
cd ExpenseTracker.AppHost
dotnet run
```

3. Open the Aspire dashboard URL shown in the console output to monitor both services.

## 🔧 Manual Setup (Alternative)

You can also run the services independently:

### Initialize PostgreSQL and install dependencies

Create an empty PostgreSQL database named `expense_tracker`. Export a
connection string if your credentials differ from the local default
(`postgresql://postgres:postgres@localhost:5432/expense_tracker`).

```bash
export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/expense_tracker'
npm --prefix backend ci
npm --prefix frontend ci
(cd backend && node setup-db.js)
```

The setup command creates the application tables and default categories. Set
`DATABASE_URL` in the backend process environment or in `backend/.env`.
For a remote database, configure TLS in the PostgreSQL connection string.

### Development

Run these commands in two terminals from the repository root.

```bash
npm --prefix backend start
npm --prefix frontend start
```

Open http://localhost:3000. Webpack forwards API requests to the backend on port
3001. Set `BACKEND_URL` for a different backend address. For direct requests
from a browser on another origin, set `CLIENT_ORIGIN` on the backend.

### Production build

```bash
npm --prefix frontend run build
NODE_ENV=production npm --prefix backend start
```

Open http://localhost:3001. Express serves the compiled UI and API on the same
origin. The workshop application uses a shared database and has no user
authentication. Run it in a trusted environment.

## 📊 Architecture

- **Frontend**: React with Webpack dev server
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (setup instructions in README-database-setup.md)
- **Orchestration**: .NET Aspire AppHost

## 🏥 Health Monitoring

Both services include health check endpoints:

- Backend: `GET http://localhost:3001/health` 
- Frontend: `GET http://localhost:3000/health`

## 📖 Documentation

- [Database Setup Guide](README-database-setup.md)
- [Aspire Configuration Guide](README-aspire.md)
- [Business Requirements](expense-tracker-business-requirements.md)
- [UI Requirements](business-requirement-ui.md)

## 🛠 Development

The .NET Aspire setup provides:
- Centralized logging from all services
- Service discovery and configuration
- Health monitoring dashboard
- Hot reload for development
- Production-ready deployment patterns

For detailed Aspire configuration, see [README-aspire.md](README-aspire.md).
