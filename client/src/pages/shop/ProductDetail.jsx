import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { Loader2, ShoppingCart, ArrowLeft, Minus, Plus, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const addToCart = useCartStore((state) => state.addToCart);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await productsAPI.getOne(id);
                setProduct(res.data.order || res.data.product || res.data);
            } catch (error) {
                console.error('Failed to fetch product', error);
                toast.error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!product) return;
        const success = await addToCart(product._id, quantity);
        if (success) {
            toast.success('Added to cart');
        } else {
            toast.error('Failed to add to cart');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-24">
                <h2 className="text-3xl font-display font-bold text-secondary-900">Product not found</h2>
                <Link to="/" className="mt-6 text-primary-600 hover:text-primary-700 inline-flex items-center gap-2 font-medium">
                    <ArrowLeft className="h-4 w-4" /> Back to Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link to="/" className="inline-flex items-center gap-2 text-secondary-500 hover:text-primary-600 mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Collection
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
                {/* Image Gallery */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-4"
                >
                    <div className="aspect-square bg-secondary-100 rounded-3xl overflow-hidden shadow-sm">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary-400">
                                No Image
                            </div>
                        )}
                    </div>
                    {/* Thumbnails placeholder */}
                    <div className="grid grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-square bg-secondary-50 rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-primary-500 transition-all">
                                {product.image && (
                                    <img src={product.image} alt="" className="w-full h-full object-cover opacity-70 hover:opacity-100" />
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Product Info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col"
                >
                    <div className="mb-2">
                        <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">
                            {product.category?.name || 'Premium Collection'}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary-900 mb-4 leading-tight">
                        {product.title}
                    </h1>

                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-3xl font-bold text-secondary-900">₹{product.price}</span>
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current text-secondary-300" />
                            <span className="text-secondary-500 text-sm ml-2">(4.8)</span>
                        </div>
                    </div>

                    <p className="text-secondary-600 leading-relaxed mb-8 text-lg">
                        {product.description}
                    </p>

                    <div className="border-t border-secondary-200 pt-8 mt-auto">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="flex items-center border border-secondary-300 rounded-full p-1">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary-100 text-secondary-600 disabled:opacity-50 transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-bold text-secondary-900 text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary-100 text-secondary-600 disabled:opacity-50 transition-colors"
                                    disabled={quantity >= product.stock}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <span className="text-sm text-secondary-500">
                                {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
                            </span>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="flex-1 bg-secondary-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-secondary-800 transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button className="p-4 border border-secondary-300 rounded-full hover:bg-secondary-50 transition-colors text-secondary-900">
                                <Star className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-secondary-100">
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-secondary-900">Free Shipping</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-secondary-900">Secure Payment</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                                    <RefreshCw className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-secondary-900">Free Returns</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
