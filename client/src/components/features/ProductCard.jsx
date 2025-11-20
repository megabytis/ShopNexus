import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ProductCard({ product, index = 0 }) {
    const addToCart = useCartStore((state) => state.addToCart);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        const success = await addToCart(product._id, 1);
        if (success) {
            toast.success('Added to cart');
        } else {
            toast.error('Failed to add to cart');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >
            <Link to={`/products/${product._id}`} className="group block h-full">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-secondary-100 h-full flex flex-col relative">
                    {/* Image Container */}
                    <div className="aspect-[4/5] w-full bg-secondary-100 relative overflow-hidden">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary-400 bg-secondary-50">
                                No Image
                            </div>
                        )}

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="p-3 bg-white text-secondary-900 rounded-full shadow-lg hover:bg-primary-600 hover:text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Add to Cart"
                            >
                                <ShoppingCart className="h-5 w-5" />
                            </button>
                            <div className="p-3 bg-white text-secondary-900 rounded-full shadow-lg hover:bg-primary-600 hover:text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                                <Eye className="h-5 w-5" />
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {product.stock === 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                    Out of Stock
                                </span>
                            )}
                            {/* Example 'New' badge logic */}
                            {new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                                <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                    New
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow">
                        <div className="mb-2">
                            <p className="text-xs font-medium text-primary-600 uppercase tracking-wider mb-1">
                                {product.category?.name || 'Collection'}
                            </p>
                            <h3 className="text-base font-bold text-secondary-900 line-clamp-1 group-hover:text-primary-700 transition-colors">
                                {product.title}
                            </h3>
                        </div>

                        <div className="mt-auto flex items-end justify-between">
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-secondary-900">₹{product.price}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
