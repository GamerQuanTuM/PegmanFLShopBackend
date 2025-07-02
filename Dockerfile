# Use Node.js 20 for better ES module support
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install pnpm first
RUN npm install -g pnpm

# Copy package files with explicit permissions
COPY --chmod=644 package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code with proper permissions
COPY --chmod=755 . .

# Copy environment file if it exists
COPY --chmod=644 .env* ./

# Ensure all files have correct permissions
RUN find . -type f -exec chmod 644 {} \; && \
    find . -type d -exec chmod 755 {} \; && \
    chmod +x node_modules/.bin/* || true

# Build the TypeScript application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "dist/index.js"]