# -------------------------------
# Stage 1 — Build Layer
# -------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Only copy package files first (caching trick)
COPY package*.json ./

# Install all dependencies (production only)
RUN npm ci --only=production

# -------------------------------
# Stage 2 — Production Runner
# -------------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy the rest of the app
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose the backend port
EXPOSE 8888

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8888/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "app.js"]
