# Auth

POST /auth/signup
POST /auth/login
POST /auth/logout

# categories

POST /categories (admin)
GET /categories
PUT /categories/:id (admin)
DELETE /categories/:id (admin)

# Products

- products rely on categories

POST /products (admin)
GET /products
GET /products/:id
PUT /products/:id (admin)
DELETE /products/:id (admin)
GET /products?category=xyz&min=0&max=5000 (filters)

# Cart

- after existance of products, user can add them to cart

POST /cart/add
PUT /cart/update
DELETE /cart/remove/:productId
GET /cart

- cart will be stored inside the User model (embedded array)

# Checkout (pre-payment)

- cart -> Order

POST /checkout/summary

    - calculates total
    - verifies stock
    - prepares Stripe/Razorpay session

# Payments (Razorpay Dummy)

- razorpay flows before order

POST /payments/create-checkout-session
POST /payments/webhook (razorpay will ping this)

    - mark order as paid or failed

# Orders

- after payment success -> order is finalized

POST /orders (auto called after razorpay confirms payment)
GET /orders/my (user)
GET /orders/:id
GET /orders (admin)
PUT /orders/:id/status (admin) - status goes like: processing -> shipped -> delivered -> canceled
