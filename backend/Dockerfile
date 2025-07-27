# Multi-stage: dev + prod

# backend/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production --frozen-lockfile

# Development dependencies
FROM base AS dev-deps
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
USER nodeuser
EXPOSE 5000 9229
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chown -R nodeuser:nodejs /app
USER nodeuser

EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["npm", "start"]