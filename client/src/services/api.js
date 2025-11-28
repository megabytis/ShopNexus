import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint
        // We use a separate axios instance or just direct axios to avoid circular interceptors
        // providing the same base URL and credentials
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = data;

        // Update store
        useAuthStore.getState().setToken(accessToken);

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Standard error handling
    if (error.response) {
      // Don't show toast for 401s as they are handled above or are session expiries
      if (error.response.status !== 401) {
        toast.error(error.response.data?.message || "An error occurred");
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
};

export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const cartAPI = {
  get: () => api.get("/cart"),
  add: (data) => api.post("/cart/add", data),
  update: (data) => api.put("/cart/update", data),
  remove: (productId) => api.delete(`/cart/remove/${productId}`),
};

export const checkoutAPI = {
  summary: () => api.post("/checkout/summary"),
  pay: (data) => api.post("/checkout/pay", data),
};

export const ordersAPI = {
  getMyOrders: () => api.get("/orders/my"),
  getOne: (id) => api.get(`/orders/${id}`),
  getAll: (params) => api.get("/orders", { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};
