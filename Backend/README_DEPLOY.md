# Deploy to Render

## Prerequisites
- GitHub account
- Render account (free tier available at https://render.com)

## Deployment Steps

### 1. Push Code to GitHub
```bash
cd "c:\Users\Gagandeep.Singh\Desktop\personal_project\Smart Health\Backend"
git init
git add .
git commit -m "Initial commit for Render deployment"
# Create a new repository on GitHub, then:
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy on Render

#### Option A: Using Render Dashboard (Easiest)
1. Go to https://render.com and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: smart-health-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Click **"Create Web Service"**

#### Option B: Using render.yaml (Automatic)
1. Go to https://render.com and sign in
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and configure everything
5. Click **"Apply"**

### 3. Get Your Backend URL
After deployment completes (5-10 minutes), you'll get a URL like:
```
https://smart-health-backend.onrender.com
```

### 4. Update Frontend
Update your frontend Socket.IO connection to use the new URL:
```javascript
const socket = io('https://smart-health-backend.onrender.com');
```

## Important Notes

- **Free tier**: Service spins down after 15 minutes of inactivity
- **Cold starts**: First request after inactivity takes 30-60 seconds
- **WebSocket support**: Fully supported on Render
- **Logs**: Available in Render dashboard

## Testing Your Deployment
```bash
# Test the API
curl https://YOUR-APP-NAME.onrender.com/

# Test vitals endpoint
curl -X POST https://YOUR-APP-NAME.onrender.com/vitals \
  -H "Content-Type: application/json" \
  -d '{"heartRate": 75, "temperature": 98.6}'
```

## Troubleshooting

### Build Fails
- Check logs in Render dashboard
- Ensure all dependencies are in `package.json`

### WebSocket Connection Issues
- Ensure frontend uses `https://` (not `http://`)
- Check CORS settings in `app.js`

### Service Keeps Restarting
- Check application logs
- Verify PORT environment variable is used correctly
