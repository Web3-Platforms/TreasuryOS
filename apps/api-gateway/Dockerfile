FROM node:22-alpine

WORKDIR /app

# 1. Copy the entire monorepo workspace
COPY . .

# 2. Install all dependencies
RUN npm ci

# 3. Build the api-gateway
# In a NestJS monorepo, this usually outputs to /app/dist/apps/api-gateway/
RUN npm run build --workspace=apps/api-gateway

# 4. Set Production Environment
ENV NODE_ENV=production

# 5. Expose the port provided by Railway
EXPOSE ${PORT:-3000}

# 6. The Smart Start Command
# This command checks the global root dist folder first, then the local dist folder.
# This completely bypasses the broken `start:prod` npm script.
CMD ["sh", "-c", "node dist/apps/api-gateway/main.js || node apps/api-gateway/dist/main.js || node dist/main.js"]
