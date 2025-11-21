# 🛒 ShopNexus — Full-Stack eCommerce App (MERN + Production-Ready Auth)

![Demo](./ezgif-2cedf44d708d1d82.gif)

ShopNexus is a fully-functional, production-grade eCommerce platform built with a clean MERN architecture, JWT-based authentication, cart system, filtering, categories, checkout workflow, and real deployment setup using Vercel + Render + MongoDB Atlas.

This isn’t a “tutorial project” — it’s a complete, real-world build.

---

## 🚀 Live Demo

Frontend: https://shop-nexus-beta.vercel.app  
Backend API: https://shopnexus-vyrv.onrender.com  

---

## 🔧 Tech Stack

### **Frontend**
- React + Vite  
- Custom UI / modern component structure  
- Axios (withCredentials)  
- React Query + Context API  
- Toast notifications  
- Protected routes & state management  

### **Backend**
- Node.js + Express  
- JWT Authentication with HttpOnly + Secure + SameSite=None cookies  
- Authorization guard middleware  
- Modular routers (auth, products, categories, cart, checkout, orders)  
- Mongoose models + validators  
- CORS configured for production  
- Seed script with Faker.js  

### **Database**
- MongoDB Atlas (Cloud)  
- Structured category/product/user collections  
- Seeded product & category data  

### **Deployment**
- **Frontend:** Vercel  
- **Backend:** Render  
- **DB:** MongoDB Atlas  
- Fully configured cookie policy for cross-site auth  

---

## 🛍 Features

### 🔐 Authentication
- Signup, Login, Logout  
- HttpOnly secure cookies (production-ready)  
- `/auth/me` session check  
- JWT with 1-day expiry  

### 🛒 E-Commerce Core
- Add to cart / update / remove  
- Quantity management  
- Product filtering: category, price range, search  
- Pagination  
- Sorting  

### 📦 Checkout System
- Summary validation  
- Stock verification  
- Order creation  
- Cart clearing  
- Stock deduction  

### 📊 Admin Features
- Add / update / delete categories  
- Add / update / delete products  
- Update order status  
- Advanced order filtering with params  

---

## 📁 Folder Structure (Clean & Scalable)

```
ShopNexus/
 ├── client/        # React frontend (Vite)
 └── server/        # Node.js + Express backend
```

Backend structure:

```
server/
 ├── app.js
 ├── src/
 │   ├── routers/
 │   ├── models/
 │   ├── middleware/
 │   ├── config/
 │   ├── utils/
 │   └── seed.js
```

---

## 🧪 API Endpoints (Highlights)

### Auth  
POST `/auth/signup`  
POST `/auth/login`  
POST `/auth/logout`  
GET `/auth/me`

### Products  
GET `/products`  
POST `/products` (admin)  
PUT `/products/:id`  
DELETE `/products/:id`

### Cart  
GET `/cart`  
POST `/cart/add`  
PUT `/cart/update`  
DELETE `/cart/remove/:productId`

### Checkout  
POST `/checkout/summary`  
POST `/checkout/pay`

### Orders  
GET `/orders/my`  
GET `/orders` (admin)  
PUT `/orders/:id/status`

---

## 🎯 What I Learned

- Real-world **cookie-based auth** in production  
- Debugging **Chrome’s new partitioned cookie rules**  
- CORS across multiple origins  
- Efficient Express router structuring  
- Building scalable backend systems  
- Writing seed scripts for rapid data generation  
- Vercel + Render deployment pipelines  

---

## 🔮 Upcoming Enhancements

- Razorpay / Stripe payments  
- Admin dashboard UI  
- Wishlist + reviews  
- Better category filters  
- Product recommendation system  

---

## 📬 Contact  
If you're working on MERN stack or full-stack projects — let’s connect!  
Happy to collaborate, help, or brainstorm ideas.

---

Made with ❤️ by Miku  
