FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu

# Install PostgreSQL client tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        postgresql-client \
        curl \
        wget \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Set the default user
USER vscode
