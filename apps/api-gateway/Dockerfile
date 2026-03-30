FROM node:22-alpine

WORKDIR /app

# 1. Copy everything
COPY . .

# 2. Install dependencies
RUN npm ci

# 3. Build and CAPTURE the output
RUN echo "=== BUILDING ===" && \
    npm run build --workspace=apps/api-gateway 2>&1 && \
    echo "=== BUILD SUCCEEDED ===" || \
    (echo "=== BUILD FAILED ===" && exit 1)

# 4. Show the ENTIRE dist directory structure
RUN echo "=== DIST DIRECTORY ===" && \
    ls -R /app/dist 2>/dev/null || echo "NO DIST DIRECTORY EXISTS" && \
    echo "=== ALL main.js FILES ===" && \
    find /app -type f -name "main.js" -not -path "*/node_modules/*" 2>/dev/null || echo "NO main.js FOUND ANYWHERE"

# 5. Show the nest-cli.json config
RUN echo "=== NEST-CLI.JSON ===" && \
    cat /app/nest-cli.json 2>/dev/null || echo "NO nest-cli.json"

# 6. Show the workspace tsconfig
RUN echo "=== TSCONFIG ===" && \
    cat /app/apps/api-gateway/tsconfig.app.json 2>/dev/null || \
    cat /app/apps/api-gateway/tsconfig.json 2>/dev/null || echo "NO TSCONFIG"

ENV NODE_ENV=production
EXPOSE ${PORT:-3000}

CMD ["sh", "-c", "find /app -type f -name 'main.js' -not -path '*/node_modules/*' | head -1 | xargs -I{} node {}"]

