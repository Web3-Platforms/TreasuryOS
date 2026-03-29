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
ARG APP_NAME=api-gateway
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
