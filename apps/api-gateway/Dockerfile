FROM node:22-alpine

WORKDIR /app

# 1. Copy the entire monorepo workspace
COPY . .

# 2. Install all dependencies
RUN npm ci

# 3. Build dependency packages first, then build api-gateway
RUN npm run build -w packages/types -w packages/sdk -w packages/compliance-rules
RUN npm run build -w @treasuryos/api-gateway

# 4. Set production environment
ENV NODE_ENV=production

# 5. Expose the port provided by Railway
EXPOSE ${PORT:-3000}

# 6. Start the application
CMD ["npm", "run", "start:prod", "--workspace=apps/api-gateway"]
