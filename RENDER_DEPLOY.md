# Render Deployment Configuration (Dual System 2.0)
This configuration allows for maximum uptime by using a Cloud Backend on Render and a Local Backup on your machine.

## How it works:
1. **Primary (Render):** Your server runs 24/7 on the cloud.
2. **Secondary (Local):** If Render is down or sleeping, the web automatically tries to connect to your local Ngrok.

## Steps to Deploy:
1. Go to [Render Dashboard](https://dashboard.render.com).
2. New -> Web Service.
3. Connect your GitHub repository.
4. Name: `pickgenius-backend`.
5. Environment Variables:
   - `SCRAPER_API_KEY`: (Your key)
   - `GROQ_API_KEY`: (Your key)
   - `NODE_ENV`: `production`

## Frontend Configuration (Vercel):
Set these two variables in Vercel to activate the Dual System:
- `NEXT_PUBLIC_CLOUD_API_URL`: Your Render URL (e.g. `https://pickgenius-backend.onrender.com`)
- `NEXT_PUBLIC_API_URL`: Your current Ngrok URL (Backup).

## Health Check:
The server provides a health check at `/health` for monitoring.
