# Multi-stage build for production
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Install required system dependencies for Prisma (glibc + OpenSSL 1.1)
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl libssl1.1 \
  && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy client files
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy all source files
COPY . .

# Build client
RUN npm run client:build

# Production stage
FROM node:18-bullseye-slim

WORKDIR /app

# Install required system dependencies for Prisma at runtime (glibc + OpenSSL 1.1)
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl libssl1.1 \
  && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/client/build ./client/build

# Copy server files
COPY server.js ./
COPY utils ./utils

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]

