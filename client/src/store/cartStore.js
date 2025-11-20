import { create } from 'zustand';
import { cartAPI } from '../services/api';

export const useCartStore = create((set, get) => ({
    items: [],
    totalItems: 0,
    isLoading: false,

    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const res = await cartAPI.get();
            // Assuming response structure based on typical cart endpoints
            // The user said: GET /cart: show items with product name...
            // We need to see the exact response shape, but for now let's assume:
            // res.data.cart or res.data directly if it returns the cart array
            // Based on server code:
            // It returns user.cart populated.
            // Let's adjust this after we verify the API response.
            // For now, assume res.data is the cart array or object.
            const cartItems = res.data.cart || res.data || [];
            set({ items: cartItems, totalItems: cartItems.length, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    addToCart: async (productId, quantity = 1) => {
        set({ isLoading: true });
        try {
            await cartAPI.add({ productId, quantity });
            await get().fetchCart(); // Re-fetch to ensure sync
            return true;
        } catch (error) {
            set({ isLoading: false });
            return false;
        }
    },

    updateQuantity: async (productId, quantity) => {
        try {
            // Optimistic update
            const oldItems = get().items;
            set({
                items: oldItems.map(item =>
                    (item.productId._id === productId || item.productId === productId)
                        ? { ...item, quantity }
                        : item
                )
            });

            await cartAPI.update({ productId, quantity });
            await get().fetchCart();
        } catch (error) {
            // Rollback would go here
            get().fetchCart();
        }
    },

    removeFromCart: async (productId) => {
        try {
            const oldItems = get().items;
            set({
                items: oldItems.filter(item =>
                    (item.productId._id !== productId && item.productId !== productId)
                )
            });

            await cartAPI.remove(productId);
            await get().fetchCart();
        } catch (error) {
            get().fetchCart();
        }
    },

    clearCart: () => set({ items: [], totalItems: 0 }),
}));
