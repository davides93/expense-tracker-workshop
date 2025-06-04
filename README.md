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

### Backend API
```bash
cd backend
npm install
npm start
# Runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

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