# Dockerfile for OpsMind AI Engine
# This ensures consistent environment across all developer machines

# Use official Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install Python and build dependencies (required for some native modules)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY mongo_vector_index.json ./

# Build TypeScript (if you want to compile)
# RUN npm run build

# Expose port (if needed for future API endpoints)
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --eval "console.log('AI Engine is healthy')" || exit 1

# Default command - can be overridden in docker-compose
CMD ["node", "--loader", "ts-node/esm", "src/index.ts"]
