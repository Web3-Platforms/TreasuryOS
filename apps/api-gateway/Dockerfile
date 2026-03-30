FROM node:22-alpine

WORKDIR /app

# 1. Copy the entire monorepo workspace
COPY . .

# 2. Install all dependencies
RUN npm ci

# 3. Build the api-gateway
RUN npm run build --workspace=apps/api-gateway

# 4. Set Production Environment
ENV NODE_ENV=production

# 5. Expose the port provided by Railway
EXPOSE ${PORT:-3000}

# 6. DYNAMIC START COMMAND (Approach 1)
# This completely ignores package.json. It actively searches the /app directory 
# for the compiled main.js file and executes it with Node directly.
CMD ["sh", "-c", "echo 'Searching for compiled entrypoint...'; ENTRYPOINT=$(find . -type f -path '*/dist/*main.js' | grep -v 'node_modules' | head -n 1); echo \"Starting app at: $ENTRYPOINT\"; node \"$ENTRYPOINT\""]
