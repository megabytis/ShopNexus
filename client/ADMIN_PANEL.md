# Admin Panel Documentation

## Overview

The ShopNexus Admin Panel is a comprehensive ecommerce management system built with React, Vite, and Tailwind CSS. It provides administrators with powerful tools to manage products, orders, and view analytics.

## Features

### 🔐 Admin Authentication

- **Separate Admin Login** (`/admin/login`)
  - JWT-based authentication
  - Protected routes that verify admin role
  - Automatic redirect for non-admin users
  - Secure token storage in localStorage

### 📦 Product Management

**Pages:**

- `/admin/products` - Product list with search and filters
- `/admin/products/new` - Create new product
- `/admin/products/:id` - Edit existing product

**Features:**

- Create, Read, Update, Delete (CRUD) operations
- Product fields:
  - Name
  - Description
  - Price
  - Stock quantity
  - Category
  - Image URL
- Real-time stock indicators (low/out of stock warnings)
- Image preview
- Search functionality
- Bulk delete with confirmation

### 🛒 Order Management

**Pages:**

- `/admin/orders` - Order list with filters
- `/admin/orders/:id` - Detailed order view

**Features:**

- View all orders in table format
- Filter by status and payment status
- Order details include:
  - Customer information
  - Shipping address
  - Order items with quantities and prices
  - Payment status
  - Order timeline
- Update order status:
  - Pending → Confirmed → Packed → Shipped → Delivered
- Visual timeline showing order progress
- Payment status tracking

### 📊 Dashboard & Analytics

**Page:** `/admin/dashboard`

**Metrics:**

- Total Revenue (from paid orders)
- Total Orders
- Orders Today
- Orders This Week
- Orders This Month

**Widgets:**

- Recent orders list
- Low stock alerts (products with stock < 10)
- Order timeline visualization
- Quick links to detailed views

## API Endpoints Used

### Authentication

```
POST /admin/auth/login    - Admin login
POST /admin/auth/logout   - Admin logout
```

### Products

```
GET    /admin/products           - List all products
GET    /admin/products/:id       - Get product details
POST   /admin/products           - Create product
PUT    /admin/products/:id       - Update product
DELETE /admin/products/:id       - Delete product
```

### Orders

```
GET   /admin/orders              - List all orders
GET   /admin/orders/:orderId     - Get order details
PATCH /admin/orders/:orderId/status - Update order status
```

## Tech Stack

- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **State Management:** Zustand (auth store)
- **HTTP Client:** Axios with interceptors
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Animations:** Framer Motion (optional)

## Project Structure

```
src/
├── pages/
│   └── admin/
│       ├── AdminLogin.jsx      - Admin login page
│       ├── Dashboard.jsx       - Analytics dashboard
│       ├── ProductsList.jsx    - Products table
│       ├── ProductForm.jsx     - Create/Edit product
│       ├── OrdersList.jsx      - Orders table
│       └── OrderDetail.jsx     - Order details & status update
├── components/
│   └── layout/
│       ├── AdminRoute.jsx      - Admin route protection
│       └── AdminLayout.jsx     - Admin panel layout with sidebar
└── services/
    └── api.js                  - API endpoints & axios instance
```

## Routes

### Public Routes

- `/admin/login` - Admin login (redirects if already logged in)

### Protected Admin Routes (requires admin role)

All routes under `/admin/*` are protected:

- `/admin` - Redirects to dashboard
- `/admin/dashboard` - Analytics overview
- `/admin/products` - Product management
- `/admin/products/new` - Add new product
- `/admin/products/:id` - Edit product
- `/admin/orders` - Order management
- `/admin/orders/:id` - Order details

## Security Features

1. **JWT Token Authentication**

   - Token stored in Zustand persist store
   - Auto-attached to all admin API requests via Axios interceptor

2. **Role-Based Access Control**

   - `AdminRoute` component checks:
     - User is authenticated
     - User has admin role
   - Non-admin users redirected to home page
   - Unauthenticated users redirected to login

3. **Token Refresh**
   - Automatic token refresh on 401 errors
   - Logout on refresh failure

## UI/UX Features

### Design

- Modern, clean interface with glassmorphism effects
- Gradient accents (purple to pink)
- Responsive design (mobile, tablet, desktop)
- Smooth transitions and hover effects
- Dark mode ready

### Components

- Sidebar navigation with active state
- Mobile-friendly hamburger menu
- Loading states with spinners
- Empty states with helpful messages
- Status badges with color coding
- Confirmation dialogs for destructive actions

### User Feedback

- Toast notifications for success/error
- Form validation
- Inline error messages
- Loading indicators

## Getting Started

### Prerequisites

1. Backend API running with admin endpoints
2. Admin user created in database with `role: 'admin'`

### Running the Admin Panel

1. Install dependencies:

```bash
cd client
npm install
```

2. Set environment variables:

```bash
# .env
VITE_API_BASE_URL=http://localhost:8888
```

3. Start development server:

```bash
npm run dev
```

4. Access admin panel:

```
http://localhost:5173/admin/login
```

### Default Admin Credentials (if seeded)

```
Email: admin@shopnexus.com
Password: [as per your backend seed]
```

## Future Enhancements

- [ ] Category management interface
- [ ] Bulk product import/export (CSV)
- [ ] Advanced analytics charts
- [ ] Order filtering by date range
- [ ] Product image upload (vs URL only)
- [ ] Email notifications for new orders
- [ ] Inventory tracking and alerts
- [ ] User management
- [ ] Discount/coupon management
- [ ] Sales reports and exports

## Troubleshooting

### Common Issues

**Issue:** Cannot access admin panel

- **Solution:** Ensure user has `role: 'admin'` in database

**Issue:** Token expired errors

- **Solution:** Clear localStorage and log in again

**Issue:** API errors

- **Solution:** Check backend is running and CORS is configured

**Issue:** Images not loading

- **Solution:** Verify image URLs are accessible and valid

## Support

For issues or questions, please refer to the main project README or create an issue in the repository.
