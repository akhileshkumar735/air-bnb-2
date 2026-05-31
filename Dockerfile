FROM node:18-alpine

WORKDIR /app

# Copy package metadata first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy backend source code files
COPY . .

# Expose backend service port
EXPOSE 8000

# Set environment runtime mode
ENV NODE_ENV=production

# Run database seeder before launch if needed, or boot the application directly
CMD ["node", "app.js"]
