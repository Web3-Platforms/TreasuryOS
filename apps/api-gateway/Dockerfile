FROM node:22-alpine

WORKDIR /app

# 1. Copy the entire monorepo workspace
COPY . .

# 2. Install all dependencies
RUN npm ci

# 3. Build the entire monorepo so shared packages are compiled and available
RUN npm run build

# 4. Copy compiled output to where start:prod expects it
RUN cp -r dist/apps/api-gateway/* apps/api-gateway/dist/

# 5. Set production environment
ENV NODE_ENV=production

# 6. Expose the port provided by Railway
EXPOSE ${PORT:-3000}

# 7. Start the application
CMD ["npm", "run", "start:prod", "--workspace=apps/api-gateway"]
