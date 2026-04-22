# Step 1: Base image for building
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: Image for production dependencies
FROM node:22-alpine

RUN apk add --no-cache bash ffmpeg

WORKDIR /app

# Copy only package files first
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Install ONLY production deps and prune bloat pulled in by transitive dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force && \
    rm -rf node_modules/googleapis && \
    rm -rf node_modules/typescript && \
    rm -rf node_modules/@swc && \
    rm -rf node_modules/@nestjs/cli

# Copy built output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/start-prod.sh ./start-prod.sh

RUN chmod +x start-prod.sh

CMD ["./start-prod.sh"]