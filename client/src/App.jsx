import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';

// Customer Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/shop/Home';
import ProductDetail from './pages/shop/ProductDetail';
import Cart from './pages/shop/Cart';
import Checkout from './pages/shop/Checkout';
import Orders from './pages/user/Orders';
import OrderDetail from './pages/user/OrderDetail';
import OrderSuccess from './pages/shop/OrderSuccess';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import ProductsList from './pages/admin/ProductsList';
import ProductForm from './pages/admin/ProductForm';
import OrdersList from './pages/admin/OrdersList';
import AdminOrderDetail from './pages/admin/OrderDetail';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Routes - Standalone */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Admin Login - Standalone */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Customer Layout Routes */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="products/:id" element={<ProductDetail />} />
                    <Route path="cart" element={<Cart />} />

                    {/* Protected User Routes */}
                    <Route path="checkout" element={
                        <ProtectedRoute>
                            <Checkout />
                        </ProtectedRoute>
                    } />
                    <Route path="orders/my" element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    } />
                    <Route path="orders/:id" element={
                        <ProtectedRoute>
                            <OrderDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="order-success" element={
                        <ProtectedRoute>
                            <OrderSuccess />
                        </ProtectedRoute>
                    } />
                </Route>

                {/* Admin Panel - Protected Routes with Admin Layout */}
                <Route path="/admin" element={
                    <AdminRoute>
                        <AdminLayout />
                    </AdminRoute>
                }>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="products" element={<ProductsList />} />
                    <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/:id" element={<ProductForm />} />
                    <Route path="orders" element={<OrdersList />} />
                    <Route path="orders/:id" element={<AdminOrderDetail />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
