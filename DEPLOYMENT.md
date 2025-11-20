# ShopNexus - Production Deployment Guide

## 🚀 Quick Setup

### Frontend (.env configuration)
The frontend is now configured to use your Render backend:
```
VITE_API_BASE_URL=https://shopnexus-vyrv.onrender.com
```

### Backend (Render Environment Variables)
Ensure these are set in your Render dashboard:

1. **MONGO_CONNECTION_STRING**
   - Your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/shopDB`

2. **JWT_SECRET_KEY**
   - A secure random string for JWT signing
   - Example: `your-super-secret-jwt-key-change-this-in-production`

3. **NODE_ENV** (optional)
   - Set to `production`

## 🔧 CORS Configuration
The backend now accepts requests from **all origins** with credentials enabled. This is suitable for development/testing. For production, consider restricting to specific domains.

## 📝 Testing Checklist

### Local Testing with Render Backend:
1. ✅ Create `.env` file in client directory
2. ✅ Restart Vite dev server: `npm run dev`
3. ✅ Open browser and test:
   - Login/Signup
   - Browse products
   - Add to cart
   - Checkout with shipping address
   - View orders

### Common Issues:

**Issue**: CORS errors
- **Solution**: Ensure backend CORS is set to `origin: true` or includes your frontend URL

**Issue**: 401 Unauthorized errors
- **Solution**: Clear browser cookies and login again

**Issue**: Connection refused
- **Solution**: Verify Render backend is running and accessible at https://shopnexus-vyrv.onrender.com

**Issue**: Database errors
- **Solution**: Check MongoDB Atlas connection string and IP whitelist (allow 0.0.0.0/0 for Render)

## 🌐 Deploying Frontend

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel

# Set environment variable in Vercel dashboard:
# VITE_API_BASE_URL = https://shopnexus-vyrv.onrender.com
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
cd client
npm run build
netlify deploy --prod

# Set environment variable in Netlify dashboard:
# VITE_API_BASE_URL = https://shopnexus-vyrv.onrender.com
```

### Option 3: Render (Static Site)
1. Push code to GitHub
2. Create new "Static Site" on Render
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_BASE_URL=https://shopnexus-vyrv.onrender.com`

## 🔐 Security Recommendations for Production

1. **CORS**: Update `server/app.js` to whitelist only your frontend domain:
   ```javascript
   origin: ["https://your-frontend-domain.com"]
   ```

2. **Environment Variables**: Never commit `.env` files (already gitignored)

3. **MongoDB**: Ensure strong password and IP whitelist configured

4. **JWT Secret**: Use a strong, random secret key

5. **HTTPS**: Both frontend and backend should use HTTPS (Render provides this)

## 📊 Monitoring

- **Render Dashboard**: Monitor backend logs and performance
- **Browser DevTools**: Check Network tab for API calls
- **MongoDB Atlas**: Monitor database operations

## 🎉 You're All Set!

Your ShopNexus application is now ready for production use!
