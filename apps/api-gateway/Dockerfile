FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy the application cleanly into the container.
# Railway respects our `.dockerignore`, so this copies `package.json` and the pre-built 
# `dist/` directory, while completely ignoring local `node_modules/`, `.git`, `.env`, etc.
COPY . .

# Install dependencies specifically for the Linux Alpine architecture.
# Using --omit=dev skips installing development tools (like TypeScript or Jest) 
# and prevents memory spikes during Railway deployment. 
RUN npm ci --omit=dev && npm cache clean --force

# Set standard production defaults
ENV NODE_ENV=production
EXPOSE ${PORT:-3000}

# Start the application using the pre-compiled dist/ directory
CMD ["node", "dist/apps/api-gateway/main.js"]
