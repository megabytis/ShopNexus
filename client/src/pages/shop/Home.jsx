import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../../services/api';
import ProductCard from '../../components/features/ProductCard';
import { Loader2, Search, Filter, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    // Filters state
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('min') || '';
    const maxPrice = searchParams.get('max') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoriesAPI.getAll();
                setCategories(res.data.categories || []);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = {
                    page,
                    limit: 12, // Increased limit for better grid
                    category: category || undefined,
                    min: minPrice || undefined,
                    max: maxPrice || undefined,
                    search: search || undefined,
                    sortBy,
                };

                Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

                const res = await productsAPI.getAll(params);
                setProducts(res.data.products || []);
                setTotalProducts(res.data.totalProducts || 0);
                setTotalPages(res.data.totalPages || 0);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, category, minPrice, maxPrice, search, sortBy]);

    const updateFilters = (newFilters) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                newParams.set(key, value);
            } else {
                newParams.delete(key);
            }
        });
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section - Only show on first page with no filters */}
            {!search && !category && page === 1 && (
                <section className="relative h-[600px] rounded-3xl overflow-hidden mb-16 mx-4 sm:mx-8 mt-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 to-secondary-800">
                        <img
                            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80"
                            alt="Hero"
                            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                        />
                    </div>
                    <div className="absolute inset-0 flex items-center">
                        <div className="max-w-7xl mx-auto px-8 w-full">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="max-w-2xl"
                            >
                                <span className="text-primary-400 font-bold tracking-wider uppercase mb-4 block">New Collection 2025</span>
                                <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
                                    Elevate Your <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">Everyday Style</span>
                                </h1>
                                <p className="text-xl text-secondary-200 mb-8 leading-relaxed">
                                    Discover our curated selection of premium essentials designed for the modern lifestyle. Quality meets aesthetics.
                                </p>
                                <button
                                    onClick={() => document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-white text-secondary-900 px-8 py-4 rounded-full font-bold hover:bg-primary-50 transition-colors inline-flex items-center gap-2"
                                >
                                    Shop Now <ArrowRight className="h-5 w-5" />
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}

            <div id="shop-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters */}
                    <aside className={clsx(
                        "lg:w-64 flex-shrink-0 lg:block",
                        showFilters ? "fixed inset-0 z-40 bg-white p-6 overflow-y-auto" : "hidden"
                    )}>
                        <div className="flex justify-between items-center lg:hidden mb-6">
                            <h3 className="font-bold text-xl">Filters</h3>
                            <button onClick={() => setShowFilters(false)}><X className="h-6 w-6" /></button>
                        </div>

                        <div className="space-y-8">
                            {/* Search Mobile */}
                            <div className="lg:hidden mb-6">
                                <label className="text-sm font-bold text-secondary-900 mb-3 block">Search</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="w-full pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        value={search}
                                        onChange={(e) => updateFilters({ search: e.target.value })}
                                    />
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <h3 className="font-bold text-secondary-900 mb-4">Categories</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center group cursor-pointer">
                                        <input
                                            type="radio"
                                            name="category"
                                            className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
                                            checked={category === ''}
                                            onChange={() => updateFilters({ category: '' })}
                                        />
                                        <span className="ml-3 text-secondary-600 group-hover:text-primary-600 transition-colors">All Categories</span>
                                    </label>
                                    {categories.map((cat) => (
                                        <label key={cat._id} className="flex items-center group cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
                                                checked={category === cat._id}
                                                onChange={() => updateFilters({ category: cat._id })}
                                            />
                                            <span className="ml-3 text-secondary-600 group-hover:text-primary-600 transition-colors">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h3 className="font-bold text-secondary-900 mb-4">Price Range</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-secondary-500 mb-1 block">Min</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                                            value={minPrice}
                                            onChange={(e) => updateFilters({ min: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-secondary-500 mb-1 block">Max</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                                            value={maxPrice}
                                            onChange={(e) => updateFilters({ max: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={clearFilters}
                                className="w-full py-2 text-sm text-secondary-500 hover:text-red-600 transition-colors border border-secondary-200 rounded-lg hover:border-red-200"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-secondary-200 rounded-lg text-secondary-700 font-medium"
                                >
                                    <Filter className="h-4 w-4" /> Filters
                                </button>
                                <p className="text-secondary-500">
                                    Showing <span className="font-bold text-secondary-900">{products.length}</span> of {totalProducts} products
                                </p>
                            </div>

                            <select
                                className="px-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                                value={sortBy}
                                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                            >
                                <option value="createdAt">Newest First</option>
                                <option value="price">Price: Low to High</option>
                                <option value="-price">Price: High to Low</option>
                                <option value="title">Name: A-Z</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl h-[400px] animate-pulse" />
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {products.map((product, index) => (
                                        <ProductCard key={product._id} product={product} index={index} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-16 flex justify-center gap-2">
                                        <button
                                            disabled={page <= 1}
                                            onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page - 1 })}
                                            className="px-6 py-3 border border-secondary-200 rounded-full text-sm font-bold text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center px-4 font-medium text-secondary-900">
                                            Page {page} of {totalPages}
                                        </div>
                                        <button
                                            disabled={page >= totalPages}
                                            onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page + 1 })}
                                            className="px-6 py-3 border border-secondary-200 rounded-full text-sm font-bold text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-secondary-200">
                                <div className="bg-secondary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="h-10 w-10 text-secondary-400" />
                                </div>
                                <h3 className="text-xl font-bold text-secondary-900 mb-2">No products found</h3>
                                <p className="text-secondary-500 max-w-md mx-auto">
                                    We couldn't find any products matching your filters. Try adjusting your search or clearing filters.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-8 text-primary-600 font-bold hover:text-primary-700"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
