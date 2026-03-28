FROM node:22-alpine AS base

# Install dependencies needed for node processes
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfile and package.jsons
COPY package.json package-lock.json ./
# Copy the full source to build everything
COPY . .

# Clean install all dependencies across workspaces
RUN npm ci

# The ARG specifies which app to build. Default to something harmless if omitted.
ARG APP_NAME=dashboard
RUN if [ "$APP_NAME" = "dashboard" ]; then \
      npm run build -w @treasuryos/dashboard; \
    elif [ "$APP_NAME" = "api-gateway" ]; then \
      npm run build -w @treasuryos/api-gateway; \
    fi

# ====================
# Runner for API Gateway
# ====================
FROM base AS api-gateway-runner
WORKDIR /app
ENV NODE_ENV=production

# We copy the entire node_modules from builder. This ensures monorepo symlinks to local packages (@treasuryos/types) remain valid.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy local packages & apps
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/package.json

EXPOSE 3001
# The api-gateway main.js will require things relative to apps/api-gateway/dist
CMD ["node", "apps/api-gateway/dist/main.js"]

# ====================
# Runner for Dashboard (Next.js Standalone)
# ====================
FROM base AS dashboard-runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Next.js standalone output contains a minimized replica of the node_modules and workspaces needed to run the app
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public
# Copy the standalone output - it creates a folder structure mirroring the monorepo root
COPY --from=builder /app/apps/dashboard/.next/standalone ./
COPY --from=builder /app/apps/dashboard/.next/static ./apps/dashboard/.next/static

EXPOSE 3000

# Since it mirrors the monorepo, the server.js is located in apps/dashboard/server.js
CMD ["node", "apps/dashboard/server.js"]
