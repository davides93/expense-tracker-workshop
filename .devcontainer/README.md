# Development Environment Setup

This project uses a containerized development environment with PostgreSQL and Azurite for local development.

## Prerequisites

- Docker Desktop
- Visual Studio Code with Dev Containers extension

## Quick Start

1. Clone the repository
2. Open in VS Code
3. When prompted, click "Reopen in Container" or run `Dev Containers: Reopen in Container` from the command palette
4. Wait for the container to build and start

## Services

### PostgreSQL Database
- **Host**: localhost
- **Port**: 5432
- **Database**: expense_tracker
- **Username**: postgres
- **Password**: postgres
- **Connection String**: `postgresql://postgres:postgres@localhost:5432/expense_tracker`

### Azurite (Azure Storage Emulator)
- **Blob Service**: http://localhost:10000
- **Queue Service**: http://localhost:10001  
- **Table Service**: http://localhost:10002
- **Account Name**: devstoreaccount1
- **Connection String**: Available as environment variable `AZURE_STORAGE_CONNECTION_STRING`

## Environment Variables

The following environment variables are automatically set in the dev container:

- `DATABASE_URL`: PostgreSQL connection string
- `AZURE_STORAGE_CONNECTION_STRING`: Azurite connection string
- `NODE_ENV`: development

## Database Schema

The PostgreSQL database is automatically initialized with the following tables:
- `users`: User accounts
- `categories`: Expense categories
- `expenses`: Individual expense records
- `budgets`: Budget tracking
- `recurring_expenses`: Recurring expense templates

Default categories are pre-populated for immediate use.

## VS Code Extensions

The dev container includes these pre-installed extensions:
- React Native Tools
- PostgreSQL management
- Azurite
- TypeScript
- Prettier
- TailwindCSS

## Port Forwarding

- 3000: React Native Metro bundler
- 5432: PostgreSQL
- 8081: React Native development server
- 10000-10002: Azurite services

## Troubleshooting

### Container won't start
- Ensure Docker Desktop is running
- Check if ports 5432, 10000-10002 are available

### Database connection issues
- Verify PostgreSQL container is running: `docker ps`
- Check logs: `docker logs <postgres-container-name>`

### Azurite connection issues
- Ensure Azurite container is running
- Use the provided connection string exactly as shown

## Development Workflow

1. Start the dev container
2. Database and storage are automatically available
3. Install React Native CLI globally (done automatically)
4. Initialize your React Native project
5. Configure database and storage connections using the provided environment variables