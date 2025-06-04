# Multi-stage Docker build for Mock Slant3D API
# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app
COPY package.json bun.lock ./

# Install bun
RUN npm install -g bun
RUN bun install

# Copy web source and config
COPY src/web/ ./src/web/
COPY tsconfig.json vite.config.ts ./

# Build React app using vite from root
RUN cd src/web && bun build app.tsx --outdir dist

# Stage 2: Build TypeScript backend  
FROM oven/bun:1-alpine AS backend-builder

WORKDIR /app
COPY package.json bun.lock tsconfig.json ./
COPY src/ ./src/
COPY data/ ./data/

RUN bun install --production
RUN bun build src/index.ts --outdir dist --target bun

# Stage 3: Production runtime
FROM oven/bun:1-alpine AS runtime

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy built assets from previous stages
COPY --from=backend-builder --chown=bun:bun /app/dist ./dist
COPY --from=backend-builder --chown=bun:bun /app/node_modules ./node_modules
COPY --from=frontend-builder --chown=bun:bun /app/src/web/dist ./public
COPY --from=backend-builder --chown=bun:bun /app/data ./data
COPY --chown=bun:bun package.json ./

# Environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Expose port
EXPOSE 4000

# Switch to non-root user
USER bun

# Start the application
CMD ["bun", "run", "dist/index.js"] 