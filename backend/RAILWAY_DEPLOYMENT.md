# Deploying to Railway.app

This guide explains how to deploy the Drone Operations Manager backend to Railway.app.

## Prerequisites

1. Create a Railway.app account at https://railway.app
2. Install the Railway CLI (optional but helpful):
   ```
   npm install -g @railway/cli
   ```

## Deployment Steps

### 1. Login to Railway

```bash
railway login
```

### 2. Initialize Your Project

Navigate to your backend directory and run:

```bash
railway init
```

### 3. Provision a PostgreSQL Database

```bash
railway add
```

Select PostgreSQL from the options. This will create a new PostgreSQL instance for your project.

### 4. Deploy Your Backend

```bash
railway up
```

### 5. Set Required Environment Variables

Through the Railway dashboard or CLI, set the following environment variables:

```
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
```

The `DATABASE_URL` will be automatically set by Railway.

### 6. Connect Your Frontend to the Backend

After deployment, get your API URL from the Railway dashboard. It will look like:
`https://drone-ops-manager-backend-production.up.railway.app`

Update your frontend environment variable:
```
REACT_APP_API_URL=https://drone-ops-manager-backend-production.up.railway.app/api
```

### 7. Initialize Database (if needed)

If you need to run your database schema:

```bash
railway run "psql \$DATABASE_URL < database_schema.sql"
```

## Monitoring and Logs

Access logs and monitoring through the Railway dashboard at https://railway.app/dashboard.

## Common Issues

1. **Connection Errors**: Make sure SSL is enabled in your database connection config
2. **Memory Limits**: If your app exceeds memory limits, adjust your plan or optimize your backend
3. **Build Failures**: Check Railway logs for details on build failures
