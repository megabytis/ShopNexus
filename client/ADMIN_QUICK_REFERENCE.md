# Admin Panel - Quick Reference Guide

## 🚀 Quick Start

### Access the Admin Panel

1. Navigate to: `http://localhost:5173/admin/login`
2. Login with admin credentials
3. You'll be redirected to `/admin/dashboard`

---

## 📑 Page Overview

### 1. Admin Login (`/admin/login`)

**Features:**

- Beautiful glassmorphism design
- Email + Password authentication
- JWT token storage
- Auto-redirect if already logged in
- Admin role verification

**Backend API:**

```javascript
POST /admin/auth/login
Body: { email, password }
Response: { user: {..., role: 'admin'}, accessToken }
```

---

### 2. Dashboard (`/admin/dashboard`)

**Displays:**

- 💰 Total Revenue (from paid orders)
- 📦 Total Orders
- 🕐 Orders Today
- 📈 Orders This Week
- 📅 Orders This Month
- 🚨 Low Stock Alerts (< 10 units)
- 📋 Recent Orders (last 5)

**Backend APIs:**

```javascript
GET /admin/orders?limit=100
GET /admin/products?limit=100
```

---

### 3. Products List (`/admin/products`)

**Features:**

- Table view of all products
- Search by product name
- Stock level indicators (color-coded)
- Edit and Delete actions
- Add New Product button

**Actions:**

- ✏️ Edit → Navigate to `/admin/products/:id`
- 🗑️ Delete → Confirmation dialog + API call
- ➕ Add New → Navigate to `/admin/products/new`

**Backend API:**

```javascript
GET /admin/products?limit=100
DELETE /admin/products/:id
```

---

### 4. Product Form (`/admin/products/new` or `/admin/products/:id`)

**Fields:**

- Product Name\* (required)
- Description
- Price\* (₹, required)
- Stock Quantity\* (required)
- Category\* (dropdown, required)
- Image URL (with preview)

**Actions:**

- Save → Create/Update product
- Cancel → Return to product list

**Backend APIs:**

```javascript
// For edit mode
GET /admin/products/:id
PUT /admin/products/:id

// For create mode
POST /admin/products
Body: {
  title: string,
  description: string,
  price: number,
  stock: number,
  category: string (ID),
  image: string (URL)
}
```

---

### 5. Orders List (`/admin/orders`)

**Displays:**

- Order ID (last 8 chars)
- Customer name & email
- Order date
- Total amount
- Payment status badge
- Order status badge
- View details button

**Filters:**

- Search by Order ID

**Backend API:**

```javascript
GET /admin/orders?limit=100
```

---

### 6. Order Detail (`/admin/orders/:id`)

**Sections:**

**A. Order Progress Timeline**

- Visual progress bar
- Status stages: Pending → Confirmed → Packed → Shipped → Delivered
- Quick status update buttons

**B. Customer Information**

- Name
- Email
- Phone

**C. Shipping Address**

- Full address with city, state, postal code

**D. Payment Information**

- Payment status badge
- Payment method

**E. Timeline**

- Confirmed at
- Packed at
- Shipped at
- Delivered at

**F. Order Items**

- Product image, name
- Quantity, price per unit
- Total price
- Order summary with total

**Actions:**

- Update status to any stage
- Back to orders list

**Backend APIs:**

```javascript
GET /admin/orders/:orderId
PATCH /admin/orders/:orderId/status
Body: { orderStatus: 'confirmed' | 'packed' | 'shipped' | 'delivered' }
```

---

## 🎨 UI Components

### Sidebar Navigation

- **Dashboard** - Analytics overview
- **Products** - Product management
- **Orders** - Order management
- **Logout** - Sign out

### Status Badges

**Payment Status:**

- 🟡 Pending (yellow)
- 🟢 Paid (green)
- 🔴 Failed (red)

**Order Status:**

- ⚪ Pending (gray)
- 🔵 Confirmed (blue)
- 🟣 Packed (indigo)
- 🟣 Shipped (purple)
- 🟢 Delivered (green)
- 🔴 Cancelled (red)

**Stock Status:**

- 🟢 > 10 units (green)
- 🟡 1-10 units (yellow)
- 🔴 0 units (red)

---

## 🔒 Security

### Protected Routes

All `/admin/*` routes are protected by `AdminRoute` component:

1. Checks if user is authenticated
2. Verifies user has `role: 'admin'`
3. Redirects to `/admin/login` if not authenticated
4. Redirects to `/` if not admin

### API Authentication

- JWT token automatically attached to all requests
- Token stored in Zustand persist store
- Auto-refresh on 401 errors
- Logout on unauthorized access

---

## 🎯 User Flow Examples

### Example 1: Adding a New Product

1. Navigate to `/admin/products`
2. Click "Add Product" button
3. Fill in product details
4. Select category from dropdown
5. Add image URL (preview shows)
6. Click "Create Product"
7. Redirected to product list

### Example 2: Updating Order Status

1. Navigate to `/admin/orders`
2. Click "View" on any order
3. See current status in timeline
4. Click desired status button (e.g., "Shipped")
5. Confirmation toast appears
6. Timeline updates visually

### Example 3: Checking Low Stock

1. Navigate to `/admin/dashboard`
2. Scroll to "Low Stock Alert" section
3. See products with < 10 units
4. Click "View all" to go to products page
5. Edit product to update stock

---

## 🎨 Color Scheme

**Primary Gradient:**

- Purple (#9333EA) to Pink (#EC4899)

**Status Colors:**

- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Info: Blue (#3B82F6)
- Neutral: Gray (#6B7280)

**Background:**

- Main: Gray-50 (#F9FAFB)
- Cards: White (#FFFFFF)
- Hover: Gray-100 (#F3F4F6)

---

## 📱 Responsive Design

**Breakpoints:**

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Features:**

- Hamburger menu for sidebar
- Collapsible tables
- Touch-friendly buttons
- Optimized spacing

---

## ⚡ Performance Tips

1. **Lazy Loading:** Consider code-splitting admin routes
2. **Pagination:** Implement for large product/order lists
3. **Image Optimization:** Use CDN for product images
4. **Caching:** Cache category data

---

## 🐛 Common Issues & Solutions

**Issue:** "Access denied" after login

- **Fix:** Check user has `role: 'admin'` in database

**Issue:** Products not loading

- **Fix:** Verify backend `/admin/products` endpoint is working

**Issue:** Can't update order status

- **Fix:** Check backend supports `PATCH /admin/orders/:orderId/status`

**Issue:** Images not showing

- **Fix:** Ensure image URLs are valid and accessible

---

## 📊 Data Models Expected

### User (Admin)

```javascript
{
  _id: string,
  name: string,
  email: string,
  role: 'admin', // REQUIRED for access
  // ... other fields
}
```

### Product

```javascript
{
  _id: string,
  title: string,      // or 'name'
  description: string,
  price: number,
  stock: number,
  category: string,   // Category ID or name
  image: string,      // URL
  createdAt: Date,
  // ... other fields
}
```

### Order

```javascript
{
  _id: string,
  userId: string | { name, email },
  items: [{
    productId: string | { title/name, image },
    quantity: number,
    price: number
  }],
  totalAmount: number,
  orderStatus: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered',
  paymentStatus: 'pending' | 'paid' | 'failed',
  paymentMethod: string,
  shippingAddress: {
    street: string,
    city: string,
    state: string,
    postalCode: string,
    country: string,
    phone: string
  },
  createdAt: Date,
  confirmedAt: Date,
  packedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  // ... other fields
}
```

---

## 🔗 Navigation Map

```
/admin/login (public)
    ↓
/admin/dashboard (protected)
    ├── View Recent Orders → /admin/orders/:id
    └── View Low Stock → /admin/products

/admin/products (protected)
    ├── Add Product → /admin/products/new
    ├── Edit Product → /admin/products/:id
    └── Delete Product (confirmation)

/admin/orders (protected)
    └── View Order → /admin/orders/:id
        └── Update Status (in-page)
```

---

## 🎓 Best Practices

1. **Always confirm destructive actions** (deletes)
2. **Provide feedback** (toast notifications)
3. **Validate forms** before submission
4. **Show loading states** during API calls
5. **Handle errors gracefully** with user-friendly messages
6. **Keep navigation clear** with breadcrumbs/back buttons
7. **Use consistent styling** across all pages
8. **Make actions reversible** when possible

---

## 📞 Support

For technical issues:

1. Check browser console for errors
2. Verify backend API is running
3. Check network tab for failed requests
4. Review `ADMIN_PANEL.md` for detailed docs

Happy managing! 🎉
