# Vercel Deployment Guide for eLibrary

This guide will help you deploy your eLibrary application to Vercel successfully.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Ensure your MongoDB cluster is accessible from anywhere (IP: 0.0.0.0/0)
3. **Environment Variables**: Have your MongoDB connection string ready

## Step 1: Prepare Your Project

### 1.1 Verify Project Structure
Ensure your project has this structure:
```
project/
├── server.js          # Main server file
├── package.json       # Node.js dependencies
├── vercel.json        # Vercel configuration
├── .env.example       # Environment variables template
├── public/            # Static files
│   ├── landing.html
│   ├── login.html
│   ├── admin-dashboard.html
│   ├── user-portal.html
│   ├── css/
│   ├── js/
│   └── assets/
└── routes/            # Additional routes (if any)
```

### 1.2 Check Dependencies
Run `npm install` to ensure all dependencies are installed:
```bash
npm install
```

### 1.3 Test Locally
Test your application locally before deployment:
```bash
npm start
```

## Step 2: Configure Environment Variables

### 2.1 Create Environment Variables
In your Vercel dashboard, add these environment variables:

| Variable Name | Example Value | Description |
|---------------|---------------|-------------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/elibrary?retryWrites=true&w=majority` | MongoDB connection string |
| `NODE_ENV` | `production` | Environment mode |
| `SESSION_SECRET` | `your-super-secret-key-change-this` | Session encryption key |
| `PORT` | `3000` | Server port (optional, Vercel handles this) |

### 2.2 MongoDB Configuration
Ensure your MongoDB Atlas cluster:
- Allows connections from `0.0.0.0/0` (or use Vercel's IP ranges)
- Has the correct database user credentials
- Uses the connection string format: `mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority`

## Step 3: Deploy to Vercel

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/elibrary.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Click "Deploy"

### Method 2: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add NODE_ENV
   vercel env add SESSION_SECRET
   ```

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

## Step 4: Configure Domain (Optional)

1. Go to your project settings in Vercel
2. Click on "Domains"
3. Add your custom domain
4. Configure DNS settings as instructed

## Common Issues & Solutions

### Issue 1: MongoDB Connection Error
**Error**: `MongooseError: The 'uri' parameter to 'openUri()' must be a string, got "undefined"`

**Solution**:
- Verify `MONGODB_URI` is set in Vercel environment variables
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Ensure connection string format is correct

### Issue 2: Static Files Not Loading
**Error**: CSS/JS files return 404

**Solution**:
- Verify `vercel.json` configuration
- Check file paths in HTML files
- Ensure `public` folder structure is correct

### Issue 3: API Routes Not Working
**Error**: API endpoints return 404

**Solution**:
- Check `vercel.json` routes configuration
- Verify API endpoints start with `/api/`
- Ensure `server.js` handles routes correctly

### Issue 4: Session Issues
**Error**: Login not persisting across requests

**Solution**:
- Set `SESSION_SECRET` in environment variables
- Configure session options for production
- Consider using external session store for production

## Step 5: Post-Deployment Testing

### Test Checklist:
- [ ] Landing page loads correctly
- [ ] CSS and JavaScript files load
- [ ] Login functionality works
- [ ] Admin dashboard accessible
- [ ] User portal functions properly
- [ ] Database operations work
- [ ] API endpoints respond correctly

### Performance Optimization:
1. **Enable caching** for static assets
2. **Compress images** in the assets folder
3. **Minify CSS/JS** files for production
4. **Use CDN** for external resources

## Environment Variables Reference

Create these in your Vercel project settings:

```env
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/elibrary?retryWrites=true&w=majority
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key-here

# Optional
PORT=3000
APP_NAME=eLibrary
JWT_SECRET=your-jwt-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Monitoring & Maintenance

### 1. Monitor Logs
- Check Vercel function logs for errors
- Monitor MongoDB Atlas metrics
- Set up error tracking (e.g., Sentry)

### 2. Regular Updates
- Keep dependencies updated
- Monitor security vulnerabilities
- Backup database regularly

### 3. Scaling Considerations
- Monitor function execution time
- Consider upgrading Vercel plan for higher limits
- Optimize database queries for performance

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally with same configuration
4. Check MongoDB Atlas connectivity
5. Review [Vercel documentation](https://vercel.com/docs)

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Access**: Use specific IP ranges instead of `0.0.0.0/0` when possible
3. **Session Security**: Use strong session secrets and consider session stores
4. **HTTPS Only**: Enable HTTPS redirects in production
5. **Input Validation**: Validate all user inputs
6. **Rate Limiting**: Implement rate limiting for API endpoints

---

## Quick Deployment Commands

```bash
# One-time setup
npm install -g vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add NODE_ENV
vercel env add SESSION_SECRET

# Production deployment
vercel --prod
```

Your eLibrary application should now be successfully deployed on Vercel! 🚀
