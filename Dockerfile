# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from frontend
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code from frontend
COPY frontend/ .

# Build Angular app
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copy built app to nginx (Angular 17+ outputs to browser/ subfolder)
COPY --from=builder /app/dist/musicstream-app/browser /usr/share/nginx/html

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
