# Render Deployment Configuration
# This file tells Render how to build and run the backend server

# Build Command (run during deployment)
# npm install

# Start Command (run to start the server)
# npm start

# Environment Variables to set in Render Dashboard:
# - SCRAPER_API_KEY: Your ScraperAPI key for bypassing rate limits
# - PORT: 10000 (Render will set this automatically)
# - NODE_ENV: production

# Health Check Endpoint: /health
# This endpoint returns server status and can be used by Render to monitor the service
