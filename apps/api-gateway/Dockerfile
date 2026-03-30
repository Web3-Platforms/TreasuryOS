FROM node:22-alpine

WORKDIR /app

# 1. Copy the entire monorepo workspace
COPY . .

# 2. Install all dependencies
RUN npm ci

# 3. Build the api-gateway
RUN npm run build --workspace=apps/api-gateway

# 4. Verify compiled files exist
RUN echo "=== COMPILED FILES ===" && \
    find . -type f -name "main.js" -not -path "*/node_modules/*" && \
    echo "=== DONE ==="

# 5. Set Production Environment
ENV NODE_ENV=production

# 6. Expose the port provided by Railway
EXPOSE ${PORT:-3000}

# 7. Start the api-gateway
WORKDIR /app/apps/api-gateway
CMD ["npm", "run", "start:prod"]

