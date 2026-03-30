# Using a Dockerfile is often more reliable than Nixpacks for Monorepos
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root configurations and lockfiles
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./

# Copy the specific app and shared packages
COPY apps/api-gateway ./apps/api-gateway
COPY packages/types ./packages/types
COPY packages/sdk ./packages/sdk
COPY packages/compliance-rules ./packages/compliance-rules

# Install dependencies using clean install
RUN npm ci

# Build the specific workspace
RUN npm run build --workspace=apps/api-gateway

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only the necessary built files and modules from the builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/package.json

# Expose the port dynamically provided by Railway
EXPOSE ${PORT:-3000}

# Start the application
CMD ["node", "apps/api-gateway/dist/main.js"]
