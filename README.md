# 🛒 ShopNexus — Full-Stack E-Commerce Platform (Production-Style)

ShopNexus is a **full-stack e-commerce platform** built with a clean MERN architecture, secure session-based authentication, role-based access control, cloud media handling, and a complete admin workflow.

This project is designed and implemented with **real-world backend and system design practices** — not tutorial shortcuts.

---

## 🚀 Live Application

**Frontend:**
[https://shop-nexus-beta.vercel.app](https://shop-nexus-beta.vercel.app)

**Admin Login (Demo):**
[https://shop-nexus-beta.vercel.app/admin/login](https://shop-nexus-beta.vercel.app/admin/login)

---

## 🔑 Demo Admin Access

For evaluation and testing purposes, a demo admin account is provided:

* **Email:** `admin.demo@shopnexus.com`
* **Password:** `Demo@1234`

> This is a functional demo. Some destructive actions may be limited and data may reset.

---

## 🎥 Project Preview

![Demo](./ezgif-2cedf44d708d1d82.gif)

---

## 🔥 Key Highlights

* **Session-based authentication** using HttpOnly cookies (refresh-token driven)
* **Role-Based Access Control (RBAC)** for user and admin separation
* **Dedicated Admin Panel** for product, order, and workflow management
* **Cloudinary-powered image uploads** (secure, CDN-backed, no local storage)
* **Stripe payment integration (test mode)** with verified checkout flow
* **Advanced order filtering** (date, amount, user, pagination)
* **Modular Express architecture** with clean MVC separation
* **Production-focused CORS & cookie configuration**
* **Fully deployed** frontend + backend + database
* No hardcoded secrets, no auth bypasses, no frontend token exposure

---

## 🧰 Tech Stack

### Frontend

* React (Vite)
* Context API
* React Query
* Axios (with credentials)
* Protected routes
* Clean admin & user interfaces

### Backend

* Node.js + Express
* Session + Refresh Token authentication
* Role-based authorization
* Multer (in-memory uploads)
* Cloudinary (media storage + CDN)
* MongoDB + Mongoose
* Pagination, filtering, validation layers

### Infrastructure / DevOps

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas
* Environment-based configuration
* Secure cookie handling across domains

---

## 🛍 Core Features

### Users

* Signup / Login / Logout
* Persistent sessions
* Secure cookie-based auth
* Protected routes

### Products

* Product listing with pagination
* Search, sorting, price filters
* Category-based browsing
* Admin-controlled CRUD

### Image Uploads

* Admin image upload via Cloudinary
* In-memory streaming (no disk storage)
* URLs stored in DB, not files

### Cart

* Add / update / remove items
* Backend stock validation
* Persistent syncing

### Checkout & Orders

* Stripe-based checkout (test mode)
* Order creation after payment
* Order lifecycle:

  ```
  Pending → Confirmed → Packed → Shipped → Delivered
  ```
* Admin-only status updates

---

## 📂 Project Structure

```
ShopNexus/
 ├── client/     # React (Vite)
 └── server/     # Node.js + Express
      ├── routers/
      ├── controllers/
      ├── models/
      ├── middleware/
      ├── config/
      └── utils/
```

Structured for clarity, scalability, and maintainability.

---

## 🧠 What This Project Demonstrates

* Designing session-based auth for modern browsers
* Secure cookie handling (`SameSite`, cross-domain)
* Backend domain modeling (users, products, orders)
* Admin-first system thinking
* Cloud-based media handling (Cloudinary)
* Real deployment workflows (Vercel + Render)
* Debugging real production issues (CORS, cookies, uploads)
* Building systems beyond CRUD

---

## 🔮 Potential Improvements

* Production payment gateway (Razorpay / Stripe live)
* Order analytics dashboard
* Image cleanup by `public_id`
* Wishlist & reviews
* Admin activity logging

---

## 📬 Contact

Open to backend or full-stack internships and entry-level roles.
Happy to discuss architecture, trade-offs, and implementation details.

---

**Built deliberately. Shipped properly.** 🚀
