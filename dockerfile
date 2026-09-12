# Use Node.js LTS version (Debian slim for better compatibility with native modules like sqlite3)
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only (skip devDependencies)
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Create database directory if it doesn't exist and set ownership to node user
RUN mkdir -p database && chown -R node:node /app

# Switch to non-root user for security
USER node

# Expose the port the app runs on (default 5000, can be overridden by PORT env)
EXPOSE 5000

# Set Node environment to production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]