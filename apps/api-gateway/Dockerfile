FROM node:22-alpine AS builder

WORKDIR /app

COPY . .
RUN npm ci
RUN npm run build --workspace=apps/api-gateway

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
EXPOSE ${PORT:-3000}

CMD ["node", "dist/apps/api-gateway/main.js"]


