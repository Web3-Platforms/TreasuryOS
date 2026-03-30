FROM node:22-alpine AS builder

WORKDIR /app

# Copy all root configurations
COPY package.json package-lock.json nest-cli.json tsconfig.base.json ./

# Copy all packages (types, sdk, compliance-rules) to ensure no missing dependencies
COPY packages ./packages

# Copy the specific app
COPY apps/api-gateway ./apps/api-gateway

# Install dependencies using clean install
RUN npm ci

# Build the specific workspace
RUN npm run build --workspace=apps/api-gateway

# --- Runner Stage ---
FROM node:22-alpine AS runner

# Set the working directory directly to the api-gateway folder
WORKDIR /app/apps/api-gateway

ENV NODE_ENV=production

# Copy root node_modules
COPY --from=builder /app/node_modules /app/node_modules

# Copy the built dist folder and package.json for this specific app
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/apps/api-gateway/package.json ./package.json

# Expose the port Railway provides
EXPOSE ${PORT:-3000}

# Start the application directly with Node (bypassing npm)
CMD ["node", "dist/main.js"]
