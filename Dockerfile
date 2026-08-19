# ==========================================
# Multi-Stage Production Dockerfile
# ==========================================

# 1. Base Image
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
RUN apk add --no-cache libc6-compat openssl

# 2. Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 3. Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client & Build Application
RUN npx prisma generate
RUN pnpm run build

# 4. Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user and prepare upload & temp directories
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser && \
    mkdir -p /app/public/uploads /tmp/comic-uploads && \
    chown -R appuser:nodejs /app /tmp/comic-uploads

COPY --chown=appuser:nodejs --from=builder /app/package.json ./package.json
COPY --chown=appuser:nodejs --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --chown=appuser:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=appuser:nodejs --from=builder /app/.next ./.next
COPY --chown=appuser:nodejs --from=builder /app/public ./public
COPY --chown=appuser:nodejs --from=builder /app/server ./server
COPY --chown=appuser:nodejs --from=builder /app/prisma ./prisma
COPY --chown=appuser:nodejs --from=builder /app/tsconfig.server.json ./tsconfig.server.json

# Ensure appuser owns all application files
RUN chown -R appuser:nodejs /app /tmp/comic-uploads

USER appuser

EXPOSE 5000

# Run monolith Next.js + Express server
CMD ["pnpm", "start"]
