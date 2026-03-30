FROM node:22-alpine AS builder

WORKDIR /app

# Copy the entire monorepo to ensure all shared packages and configs are present
COPY . .

# Install all dependencies (including devDependencies needed for the build)
RUN npm ci

# Build the api-gateway and its local workspace dependencies
RUN npm run build --workspace=apps/api-gateway

# --- Runner Stage ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy the entire built application from the builder stage
# This guarantees that all monorepo symlinks and nested dist folders are perfectly preserved
COPY --from=builder /app ./

# Expose the port Railway provides
EXPOSE ${PORT:-3000}

# Bulletproof start command: 
# It checks the standard NestJS path, then the nested TS path, and falls back to your npm script.
CMD ["sh", "-c", "node apps/api-gateway/dist/main.js || node apps/api-gateway/dist/src/main.js || npm run start:prod --workspace=apps/api-gateway"]]
