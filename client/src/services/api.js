import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888';

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;
        if (response) {
            if (response.status === 401 || response.status === 403) {
                // Dispatch a custom event so the auth store can listen and logout
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            }
            // Don't show toast for 401s as they might be just session checks
            if (response.status !== 401) {
                toast.error(response.data?.message || 'An error occurred');
            }
        } else {
            toast.error('Network error. Please check your connection.');
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
};

export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getOne: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

export const cartAPI = {
    get: () => api.get('/cart'),
    add: (data) => api.post('/cart/add', data),
    update: (data) => api.put('/cart/update', data),
    remove: (productId) => api.delete(`/cart/remove/${productId}`),
};

export const checkoutAPI = {
    summary: () => api.post('/checkout/summary'),
    pay: () => api.post('/checkout/pay'),
};

export const ordersAPI = {
    getMyOrders: () => api.get('/orders/my'),
    getOne: (id) => api.get(`/orders/${id}`),
    getAll: (params) => api.get('/orders', { params }),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};
