# ========================================
# Server Dockerfile (Express + TypeScript)
# ========================================
FROM node:20-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy ai-engine package files and install dependencies
COPY ai-engine/package*.json ./ai-engine/
RUN cd ai-engine && npm install

# Copy server package files and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy ai-engine source and TypeScript config
COPY ai-engine/tsconfig.json ./ai-engine/
COPY ai-engine/src ./ai-engine/src

# Copy server TypeScript configuration and source code
COPY server/tsconfig.json ./server/
COPY server/src ./server/src

# Set working directory to server for build and runtime
WORKDIR /app/server

# Expose server port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Build TypeScript to JavaScript
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Start the server
CMD ["npm", "start"]
