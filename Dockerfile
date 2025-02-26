# Build stage
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:20-slim AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/build ./build

# Create non-root user
RUN addgroup --system mcp && \
    adduser --system --ingroup mcp mcpuser

# Set ownership
RUN chown -R mcpuser:mcp /app

# Switch to non-root user
USER mcpuser

# Command to run the server
ENTRYPOINT ["node", "build/index.js"] 