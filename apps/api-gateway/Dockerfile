FROM node:22-alpine

WORKDIR /app

# 1. Copy the entire monorepo workspace
COPY . .

# 2. Install all dependencies
RUN npm ci

# 3. Build the api-gateway
RUN npm run build --workspace=apps/api-gateway

# 4. DEBUG: Print out the location of the compiled files so we can see them in Railway logs
RUN echo "=== LOCATING COMPILED FILES ===" && \
    find . -type f -name "main.js" -not -path "*/node_modules/*"

# 5. Set Production Environment
ENV NODE_ENV=production

# 6. Expose the port provided by Railway
EXPOSE ${PORT:-3000}

# 7. THE ULTIMATE START COMMAND
# This completely ignores your package.json 'start:prod' script.
# It actively searches the container for the compiled main.js file and executes it.
CMD ["sh", "-c", "ENTRY=$(find . -type f -name 'main.js' -not -path '*/node_modules/*' | head -n 1); echo \"Starting server at: $ENTRY\"; node \"$ENTRY\""]
