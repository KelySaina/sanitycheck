# ---- 1. Build stage ----
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependencies
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.* ./

# Install deps before copying source (better layer caching)
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# ---- 2. Production stage ----
FROM nginx:stable-alpine AS production

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: remove default nginx config and use your own
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
