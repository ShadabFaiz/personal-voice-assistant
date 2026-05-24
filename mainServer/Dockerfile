# Step 1: Base image for building
FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: Final runtime image
FROM node:22-alpine

# Install system dependencies
RUN apk add --no-cache bash ffmpeg

WORKDIR /app

# Copy built output (everything is bundled in main.js)
COPY --from=builder /app/dist ./dist
# Copy startup script
COPY --from=builder /app/start-prod.sh ./
RUN chmod +x start-prod.sh

# The application is standalone, no node_modules needed
ENV NODE_ENV=production

EXPOSE 3000

CMD ["./start-prod.sh"]