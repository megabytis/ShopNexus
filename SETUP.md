# ShopNexus - Environment Setup Checklist

## ✅ Completed Configuration

### Frontend
- [x] Created `.env` file with Render backend URL
- [x] API base URL: `https://shopnexus-vyrv.onrender.com`

### Backend
- [x] Updated CORS to allow all origins
- [x] Configured for production deployment

## 🔑 Required Environment Variables on Render

### Backend (https://shopnexus-vyrv.onrender.com)
Set these in your Render dashboard → Environment:

```
MONGO_CONNECTION_STRING=mongodb+srv://your-username:your-password@cluster.mongodb.net/shopDB
JWT_SECRET_KEY=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
```

## 🧪 Testing Steps

1. **Restart Client** (to load new .env):
   ```bash
   cd client
   npm run dev
   ```

2. **Open Browser**: http://localhost:5173

3. **Test Flow**:
   - [ ] Signup/Login
   - [ ] Browse products (filters, sorting, pagination)
   - [ ] Add items to cart
   - [ ] Update cart quantities
   - [ ] Proceed to checkout
   - [ ] Fill shipping address
   - [ ] Complete payment
   - [ ] View orders

4. **Check Browser Console**:
   - Network tab should show requests to `https://shopnexus-vyrv.onrender.com`
   - No CORS errors

## 🚨 Troubleshooting

### CORS Errors
- Ensure backend `app.js` has `origin: true`
- Check Render logs for errors

### 401 Unauthorized
- Clear browser cookies
- Login again with fresh credentials

### Database Connection Failed
- Verify MongoDB Atlas connection string
- Check IP whitelist (allow `0.0.0.0/0` for Render)
- Ensure database user has read/write permissions

### Render Backend Not Responding
- Check Render dashboard for service status
- View logs for errors
- Ensure service is not sleeping (free tier sleeps after inactivity)

## 📦 Next Steps: Deploy Frontend

See `DEPLOYMENT.md` for detailed frontend deployment options (Vercel, Netlify, Render).
