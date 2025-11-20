# ShopNexus Client

This is the frontend application for ShopNexus, built with React, Vite, and TailwindCSS.

## Prerequisites

- Node.js (v16 or higher)
- ShopNexus Server running on port 8888

## Setup & Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Ensure `.env` exists with the correct API URL:
    ```
    VITE_API_BASE_URL=http://localhost:8888
    ```

3.  **Start Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    Visit [http://localhost:5173](http://localhost:5173)

## Features

- **Authentication**: Login, Signup, Protected Routes
- **Shop**: Product Listing, Filtering, Search, Product Details
- **Cart**: Manage cart items
- **Checkout**: Order summary and payment
- **User**: Order history
- **Admin**: Dashboard for managing products, categories, and orders

## Technologies

- React + Vite
- TailwindCSS
- Zustand (State Management)
- React Router v6
- React Hook Form + Yup
- Axios
- Lucide React (Icons)
- React Hot Toast
