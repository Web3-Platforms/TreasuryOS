FROM node:22-alpine AS builder

WORKDIR /app

# Copy the entire monorepo source
COPY . .

# Install all dependencies (including dev tools required for building)
RUN npm ci

# Compile the gateway application
RUN npm run build --workspace=@treasuryos/api-gateway

# Prune dev dependencies before creating final image to keep it lean
RUN npm prune --production

# --- RUNNER STAGE ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
EXPOSE ${PORT:-3000}

# Copy only the essentials from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist

# Because of ESM module import nuances in certain solana libraries, we execute using tsx
CMD ["node", "node_modules/tsx/dist/cli.mjs", "apps/api-gateway/src/main.ts"]
