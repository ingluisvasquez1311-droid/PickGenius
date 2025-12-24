# Render Deployment Configuration (Dual System 2.0)
This configuration allows for maximum uptime by using a Cloud Backend on Render and a Local Backup on your machine.

## How it works (Bridge Strategy):
1. **Primary (Render):** Your server runs 24/7 on the cloud.
2. **Data Source:** Render will automatically try to fetch data through your **Local Ngrok** tunnel. This allows Render to use your "Home IP" which isn't blocked by Sofascore.
3. **Backup:** If your PC is off, Render will try ScraperAPI or### Render Deployment (Backend)

1. Create a new **Web Service** on Render.
2. Select your repository.
3. **Name**: Use something unique like `pg-backend-v3`, `pickgenius-api-prod`, or `pg-engine-real`. (If `pickgenius-backend` is taken).
4. **Environment Variables**:
   - `GROQ_API_KEYS`: (Copy and paste all 30 keys from your .env, separated by commas)
   - `SCRAPER_API_KEYS`: `a07c3dcd21994826b72e32f9dfb42eda05f9955110f,ae195cbc8ba44b2bbd6e03daeb64b8150b3e4367688,bee8de2c54d4494c928b2be7de1d32ac803703f4373`
   - `LOCAL_BRIDGE_URL`: Your Ngrok URL (e.g. `https://xxxx.ngrok-free.app`)
   - `NODE_ENV`: `production`
   - `USE_PROXY`: `true`

## Web Deployment (Vercel)

Update these in Vercel:
- `NEXT_PUBLIC_CLOUD_API_URL`: Your new Render URL.
- `NEXT_PUBLIC_API_URL`: Your Ngrok URL.
g. `https://pickgenius-backend.onrender.com`)
- `NEXT_PUBLIC_API_URL`: Your current Ngrok URL (Backup).

## Health Check:
The server provides a health check at `/health` for monitoring.
