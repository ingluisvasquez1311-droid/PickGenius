# Google Cloud Run Optimized Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Cloud Run defaults to port 8080
ENV PORT=8080
EXPOSE 8080

# Start command
CMD ["node", "server.js"]
