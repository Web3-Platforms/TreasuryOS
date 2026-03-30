FROM node:22-alpine

WORKDIR /app

# 1. Copy the entire monorepo workspace
COPY . .

# 2. Install all dependencies
RUN npm ci

# 3. Build the api-gateway
# In a NestJS monorepo, this outputs to the root folder: /app/dist/apps/api-gateway/
RUN npm run build --workspace=apps/api-gateway

# 4. THE MONOREPO FIX
# Railway forces 'npm run start:prod', which expects the files to be in the local dist folder.
# We copy the compiled files from the root dist folder to exactly where npm is looking for them.
RUN mkdir -p apps/api-gateway/dist && \
    cp -r /app/dist/apps/api-gateway/* /app/apps/api-gateway/dist/

# 5. Set Production Environment
ENV NODE_ENV=production

# 6. Expose the port provided by Railway
EXPOSE ${PORT:-3000}

# 7. Start the application
# We now explicitly run the command Railway expects, and it will succeed because the files are in place.
CMD ["npm", "run", "start:prod", "--workspace=apps/api-gateway"]
