# ========================================
# Server Dockerfile (Express + TypeScript)
# ========================================
FROM node:20-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files for both server and ai-engine
COPY package*.json ./

# Install server dependencies
RUN npm install

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src ./src

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
