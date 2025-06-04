-- This script runs when PostgreSQL container starts
-- It's automatically executed by the docker-entrypoint-initdb.d mechanism

-- Create additional extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Log that initialization is complete
\echo 'PostgreSQL initialization script completed';
