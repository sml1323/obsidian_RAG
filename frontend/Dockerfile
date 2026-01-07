FROM node:20-slim

WORKDIR /app

# Copy package definition
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Command to run the development server
CMD ["npm", "run", "dev", "--", "--host"]
