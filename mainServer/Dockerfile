# Step 1: Base image for building
FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: Final runtime image
# We use bookworm-slim instead of alpine because Playwright Chromium requires glibc/debian packages
FROM node:22-bookworm-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y bash ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install playwright as it was marked as a webpack external
# Installing chromium and its OS dependencies alongside
RUN npm install playwright playwright-core --no-save && \
    npx playwright install --with-deps chromium

# Copy built output (everything is bundled in main.js)
COPY --from=builder /app/dist ./dist
# Copy startup script
COPY --from=builder /app/start-prod.sh ./
RUN chmod +x start-prod.sh

# The application is standalone, no node_modules needed
ENV NODE_ENV=production

EXPOSE 3000

CMD ["./start-prod.sh"]