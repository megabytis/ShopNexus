# 🛒 ShopNexus — Full-Stack E-Commerce Platform (Production Ready)

A fully featured e-commerce application built with a clean MERN architecture, real authentication, scalable backend routing, secure cookie-based login, advanced filtering, checkout logic, and complete deployment across Render + Vercel + MongoDB Atlas.

This project reflects **industry-standard practices**, not tutorial code.

---

## 🚀 Live Project

Frontend: https://shop-nexus-beta.vercel.app

---

## 🎥 Project Preview

![Demo](./ezgif-2cedf44d708d1d82.gif)

---

## 🔥 Key Highlights (Recruiter-Focused)

- **Secure, production-ready auth** using JWT + HttpOnly cookies  
- **Cross-site cookie compatibility** with Chrome’s latest `Partitioned` requirement  
- **Modular Express routing** with clean MVC-style separation  
- **Functional cart system** with state sync + persistent backend  
- **Fully validated checkout flow**  
- **Admin controls** for products, categories, and order management  
- **Advanced order filtering** (date range, amounts, product-based, user-based, pagination)  
- **Seed script for real data** using Faker.js  
- **Cloud-deployed & scalable** architecture  
- **No hardcoded hacks, no shortcuts** — genuinely production-grade logic  

---

## 🔧 Tech Stack

### Frontend (Vite + React)
- React + Context API  
- React Query  
- Axios with credentials  
- Tailored UI components  
- Protected pages  
- State-driven cart and auth  

### Backend (Node + Express)
- Express Routers  
- JWT Auth + Cookies  
- Custom middlewares  
- Robust validation layer  
- Pagination + Filtering  
- Mongoose ODM  

### DevOps
- **Frontend:** Vercel  
- **Backend:** Render  
- **Database:** MongoDB Atlas  
- CORS configured for production  
- Environment-based configuration (`NODE_ENV`, secrets, URLs)  

---

## 🛍 Main Features

### Users
- Signup / Login / Logout  
- Auto session check  
- Secure cookie token  
- No token exposure in frontend  

### Products
- Listing with pagination  
- Sorting + price range filtering  
- Search  
- Category-based browsing  

### Cart
- Add / Update / Remove items  
- Stock validation in backend  
- Cart sync with backend  

### Checkout + Orders
- Multi-step validation  
- Fake payment logic  
- Order creation  
- Admin-only status update  
- Full order filters for dashboards  

---

## 📂 Project Architecture

```
ShopNexus/
 ├── client/     # React + Vite frontend
 └── server/     # Node.js backend
      ├── routers/
      ├── models/
      ├── middleware/
      ├── utils/
      └── config/
```

Every module is designed for clarity, reusability, and maintainability.

---

## 🧠 Engineering Learnings

- Handling authentication across different domains (Chrome cross-site cookies)
- Working with secure cookies + SameSite policies  
- Designing REST APIs with multiple filters  
- Optimizing MongoDB queries  
- Structuring backend logic using MVC patterns  
- Debugging CORS systematically  
- Deployment workflows for frontend + backend  
- Designing scalable folder structures  
- Building real-world e-commerce logic (stock, orders, checkout)  

---

## 🔮 Next Improvements
- Razorpay/Stripe integration  
- Admin dashboard UI  
- Review and wishlist system  
- Improved SEO  
- Better analytics + logging  

---

## 📬 Contact  
Open to internships and full-time roles in backend or full-stack development.  
Happy to share insights or collaborate on real-world projects.

---

Built with precision and shipped with persistence 🚀
