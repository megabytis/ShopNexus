import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { Loader2, Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Cart() {
    const { items, isLoading, fetchCart, updateQuantity, removeFromCart } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const calculateTotal = () => {
        return items.reduce((total, item) => {
            const price = item.productId?.price || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    if (isLoading && items.length === 0) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="bg-secondary-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="h-10 w-10 text-secondary-400" />
                </div>
                <h2 className="text-3xl font-display font-bold text-secondary-900 mb-3">Your cart is empty</h2>
                <p className="text-secondary-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Explore our collection to find something you love.</p>
                <Link
                    to="/"
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-white bg-secondary-900 hover:bg-secondary-800 transition-all transform hover:-translate-y-1 shadow-lg"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-display font-bold text-secondary-900 mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items */}
                <div className="flex-1 space-y-6">
                    {items.map((item, index) => {
                        const product = item.productId;
                        if (!product) return null;

                        return (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-6 p-6 bg-white rounded-2xl border border-secondary-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-secondary-100 rounded-xl overflow-hidden flex-shrink-0">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-full h-full object-cover object-center"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-secondary-400 text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <Link to={`/products/${product._id}`} className="text-lg font-bold text-secondary-900 hover:text-primary-600 transition-colors line-clamp-1">
                                                {product.title}
                                            </Link>
                                            <button
                                                onClick={() => removeFromCart(product._id)}
                                                className="text-secondary-400 hover:text-red-600 transition-colors p-1"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-secondary-500 mt-1">{product.category?.name}</p>
                                    </div>

                                    <div className="flex justify-between items-end mt-4">
                                        <div className="flex items-center border border-secondary-200 rounded-lg bg-secondary-50">
                                            <button
                                                onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))}
                                                className="p-2 hover:bg-white rounded-l-lg text-secondary-600 disabled:opacity-50 transition-colors"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-10 text-center font-bold text-secondary-900 text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(product._id, Math.min(product.stock, item.quantity + 1))}
                                                className="p-2 hover:bg-white rounded-r-lg text-secondary-600 disabled:opacity-50 transition-colors"
                                                disabled={item.quantity >= product.stock}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-xl font-bold text-secondary-900">₹{product.price * item.quantity}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="lg:w-96 flex-shrink-0">
                    <div className="bg-white p-8 rounded-3xl border border-secondary-100 shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold text-secondary-900 mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-secondary-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-secondary-900">₹{calculateTotal()}</span>
                            </div>
                            <div className="flex justify-between text-secondary-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-secondary-600">
                                <span>Tax</span>
                                <span className="text-secondary-900 font-medium">₹0</span>
                            </div>
                            <div className="pt-4 border-t border-secondary-100 flex justify-between items-center">
                                <span className="text-lg font-bold text-secondary-900">Total</span>
                                <span className="text-2xl font-bold text-primary-600">₹{calculateTotal()}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full flex items-center justify-center gap-2 bg-secondary-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-secondary-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        >
                            Checkout <ArrowRight className="h-5 w-5" />
                        </button>

                        <p className="text-xs text-center text-secondary-400 mt-4">
                            Secure Checkout - SSL Encrypted
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
