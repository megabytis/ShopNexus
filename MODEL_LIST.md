# 1. user model

- for authentication

## Fields :

- name
- email
- password
- role -> "user" / "admin"
- cart : [{productId, quantity}]
- createdAt

# 2. category model

- to keep products organized + searchable

## Fields :

- name: String (unique)
- createdAt

# 3. Product Model

- core of e-commerce.

## Fields:

- title
- description
- price
- stock
- image (just a URL for now)
- category → reference to Category model
- createdAt

# 4. Order Model

- to store finalized cart transactions

## Fields:

- userId → reference to User
- items: [ { productId, quantity, priceAtPurchase } ]
- totalAmount
- paymentStatus → "pending" | "paid" | "failed"
- orderStatus → "processing" | "shipped" | "delivered" | "cancelled"
- createdAt
