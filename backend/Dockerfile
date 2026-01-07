FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy project definition
COPY pyproject.toml .

# Install dependencies
# Using pip to install from pyproject.toml
RUN pip install --no-cache-dir .
# Also install dev dependencies if needed for testing, but for now just core + uvicorn is implied by deps
# The spec asked to install dependencies. pyproject.toml has them.

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application with hot-reloading
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
