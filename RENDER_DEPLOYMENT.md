# Deploying to Render.com

This guide will walk you through deploying your Drone Operations Manager application to Render.com using their free tier.

## What We've Done

Your backend has been adapted for Render.com deployment with these changes:

1. Created a `render.yaml` file for Render's Blueprint deployment
2. Added a Render-specific database configuration in `backend/config/render-db.js`
3. Created a database selector that works in both development and production
4. Updated all model files to use the new database selector
5. Enhanced the server.js file to serve the frontend in production
6. Added CORS configuration for secure cross-origin requests

## Deployment Steps

### 1. Create a Render Account

Sign up for a free account at [Render.com](https://render.com)

### 2. Set Up Your Database

1. In the Render dashboard, click **New** and select **PostgreSQL**
2. Name your database `drone-ops-db`
3. Choose the **Free** plan
4. Set the database name to `drone_ops_manager`
5. Click **Create Database**
6. Once created, note the **Internal Database URL** - you'll need this later

### 3. Deploy Your Backend API

1. In the Render dashboard, click **New** and select **Web Service**
2. Connect your GitHub repository (you'll need to push your code to GitHub first)
3. Give your service a name, like `drone-ops-manager-api`
4. Set the **Environment** to `Node`
5. Set the **Build Command** to `cd backend && npm install`
6. Set the **Start Command** to `cd backend && node server.js`
7. Choose the **Free** plan
8. Under **Advanced** settings, add these environment variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (generate a secure random string)
   - `JWT_EXPIRES_IN`: `7d`
   - `DATABASE_URL`: (paste the Internal Database URL from step 2.6)
9. Click **Create Web Service**

### 4. Initialize Your Database

After deployment, you'll need to initialize your database with the schema:

1. In the Render dashboard, go to your PostgreSQL service
2. Click on the **Shell** tab
3. Upload your database_schema.sql file or copy and paste its contents
4. Run: `psql -d drone_ops_manager -f database_schema.sql`

### 5. Update Your Frontend

Update your frontend to point to your new Render backend:

1. In your frontend project, edit the `.env.production` file:
   ```
   REACT_APP_API_URL=https://your-backend-name.onrender.com/api
   ```
   (Replace "your-backend-name" with your actual service name)

2. Redeploy your frontend to Netlify

## Alternative Deployment: Blueprint (One-Click Deploy)

Render offers a Blueprint feature for one-click deployment of the entire stack:

1. Push your code (including the render.yaml file) to a GitHub repository
2. In the Render dashboard, click **New** and select **Blueprint**
3. Select your repository
4. Review the resources that will be created
5. Click **Apply**

This will automatically deploy both your backend API and create the database.

## Monitoring Your Application

Render provides several monitoring tools:

1. **Logs**: Real-time logs are available in the service dashboard
2. **Metrics**: CPU and memory usage statistics
3. **Health Checks**: Automatic health checks using your `/health` endpoint

## Free Tier Limitations

Be aware of these limitations on Render's free tier:

1. **Spin Down**: Free services spin down after 15 minutes of inactivity
2. **Spin Up**: It takes ~30 seconds for the service to spin up when it receives traffic
3. **Database Deletion**: Free PostgreSQL databases are deleted after 90 days
4. **Storage**: 512MB of storage for web services

For production use, consider upgrading to a paid plan when needed.

## Troubleshooting

### Connection Issues

If your frontend can't connect to the backend:

1. Verify the `REACT_APP_API_URL` is correct
2. Check that CORS is properly configured in the backend
3. Ensure your database is properly initialized

### Database Issues

If you encounter database errors:

1. Check the connection string in your environment variables
2. Verify the SSL configuration in `render-db.js`
3. Ensure your schema has been properly applied

### Memory Limits

If your application exceeds memory limits:

1. Optimize your queries
2. Implement pagination for large data sets
3. Consider upgrading to a paid plan
