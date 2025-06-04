#!/bin/bash

# Development Environment Validation Script
# This script checks if the development environment is properly configured

echo "🚀 Expense Tracker Development Environment Validation"
echo "=================================================="

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
else
    echo "❌ Docker is not available"
    exit 1
fi

# Check if docker-compose is available (standalone or as docker plugin)
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo "✅ Docker Compose is available"
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
else
    echo "❌ Docker Compose is not available"
    exit 1
fi

# Validate docker-compose.yml
if $COMPOSE_CMD -f .devcontainer/docker-compose.yml config > /dev/null 2>&1; then
    echo "✅ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has errors"
    exit 1
fi

# Check if devcontainer.json is valid JSON
if python3 -m json.tool .devcontainer/devcontainer.json > /dev/null 2>&1; then
    echo "✅ devcontainer.json is valid JSON"
else
    echo "❌ devcontainer.json is invalid JSON"
    exit 1
fi

# Check if required files exist
files=(
    ".devcontainer/devcontainer.json"
    ".devcontainer/docker-compose.yml"
    ".devcontainer/init-db.sql"
    ".devcontainer/README.md"
    ".env.example"
    ".gitignore"
)

for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

echo ""
echo "🎉 All checks passed! Your development environment is ready."
echo ""
echo "Next steps:"
echo "1. Open this project in VS Code"
echo "2. Install the Dev Containers extension if not already installed"
echo "3. Run 'Dev Containers: Reopen in Container' from the command palette"
echo "4. Wait for the containers to start"
echo "5. Start developing your React Native expense tracker app!"
echo ""
echo "Available services:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Azurite Blob: localhost:10000"
echo "  - Azurite Queue: localhost:10001"  
echo "  - Azurite Table: localhost:10002"