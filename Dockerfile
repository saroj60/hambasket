FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files first for better caching
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY backend/ .

# Expose the port (Railway will override PORT env var, but this documents intent)
EXPOSE 5000

# Start the server
CMD ["node", "simple_server.js"]
