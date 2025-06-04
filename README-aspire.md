# .NET Aspire Setup for Expense Tracker

This document describes how to use .NET Aspire to orchestrate and monitor the Expense Tracker application.

## Overview

.NET Aspire provides:
- Service orchestration for the Node.js backend and React frontend
- Centralized monitoring and logging
- Service discovery and configuration management
- Health monitoring capabilities

## Prerequisites

- .NET 8.0 SDK
- Node.js and npm
- .NET Aspire workload installed

To install the Aspire workload:
```bash
dotnet workload install aspire
```

## Project Structure

```
ExpenseTracker.AppHost/
├── Program.cs              # Aspire app configuration
├── appsettings.json        # Aspire settings
└── ExpenseTracker.AppHost.csproj
```

## Running with Aspire

1. Start the Aspire app host:
```bash
cd ExpenseTracker.AppHost
dotnet run
```

2. Open the Aspire dashboard in your browser (URL will be displayed in console output)

3. The dashboard will show:
   - Service status and health
   - Logs from both frontend and backend
   - Metrics and telemetry data
   - Service endpoints

## Services Configured

### Backend API (Node.js/Express)
- **Port**: 3001
- **Health endpoint**: `/health`
- **Readiness endpoint**: `/ready`
- **Environment**: `NODE_ENV=development`

### Frontend Web App (React)
- **Port**: 3000  
- **Health endpoint**: `/health`
- **Environment**: `REACT_APP_API_URL` (automatically configured to backend endpoint)

## Health Monitoring

Both services include enhanced health check endpoints:

### Backend Health Check (`/health`)
```json
{
  "status": "ok",
  "timestamp": "2025-06-04T15:00:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "database": "healthy",
  "uptime": 123.45
}
```

### Frontend Health Check (`/health`)
```json
{
  "status": "ok",
  "timestamp": "2025-06-04T15:00:00.000Z",
  "name": "expense-tracker-frontend",
  "version": "1.0.0",
  "environment": "development"
}
```

## Benefits of Using Aspire

1. **Centralized Monitoring**: View logs and metrics from all services in one dashboard
2. **Service Discovery**: Services can discover each other automatically
3. **Environment Management**: Consistent configuration across services
4. **Development Experience**: Easier debugging and development workflows
5. **Production Readiness**: Better observability for production deployments

## Manual Service Startup (Alternative)

If you prefer to run services manually:

1. Start backend:
```bash
cd backend
npm start
```

2. Start frontend:
```bash
cd frontend
npm start
```

## Troubleshooting

- Ensure all npm dependencies are installed (`npm install` in both frontend and backend folders)
- Check that ports 3000 and 3001 are available
- Verify .NET Aspire workload is installed correctly
- Check service logs in the Aspire dashboard for detailed error information