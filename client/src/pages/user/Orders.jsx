import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { Loader2, Package, Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const ORDERS_PER_PAGE = 10;

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await ordersAPI.getMyOrders({ page: currentPage, limit: ORDERS_PER_PAGE });
                setOrders(res.data.orders || []);
                setTotalPages(res.data.totalPages || 1);
                setTotalOrders(res.data.totalOrders || 0);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [currentPage]);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    if (loading && orders.length === 0) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!loading && orders.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="bg-secondary-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                    <Package className="h-10 w-10 text-secondary-400" />
                </div>
                <h2 className="text-3xl font-display font-bold text-secondary-900 mb-3">No orders yet</h2>
                <p className="text-secondary-500 mb-8 max-w-md">Start shopping to create your first order.</p>
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-display font-bold text-secondary-900">My Orders</h1>
                <span className="text-secondary-500 text-sm">{totalOrders} order{totalOrders !== 1 ? 's' : ''}</span>
            </div>

            <div className="space-y-4 relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                    </div>
                )}
                {orders.map((order, index) => (
                    <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            to={`/orders/${order._id}`}
                            className="block bg-white rounded-2xl border border-secondary-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                        >
                            <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono text-sm text-secondary-500 bg-secondary-50 px-2 py-1 rounded">#{order._id.slice(-8)}</span>
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                            {
                                                'bg-gray-100 text-gray-800': order.orderStatus === 'pending',
                                                'bg-blue-100 text-blue-800': order.orderStatus === 'confirmed',
                                                'bg-purple-100 text-purple-800': order.orderStatus === 'packed',
                                                'bg-indigo-100 text-indigo-800': order.orderStatus === 'shipped',
                                                'bg-green-100 text-green-800': order.orderStatus === 'delivered',
                                                'bg-red-100 text-red-800': order.orderStatus === 'cancelled',
                                            }
                                        )}>
                                            {order.orderStatus}
                                        </span>
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded text-xs font-medium",
                                            {
                                                'bg-green-50 text-green-700': order.paymentStatus === 'paid',
                                                'bg-yellow-50 text-yellow-700': order.paymentStatus === 'pending',
                                                'bg-red-50 text-red-700': order.paymentStatus === 'failed',
                                            }
                                        )}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-secondary-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                        <div>
                                            {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                    <span className="text-xl font-bold text-secondary-900">₹{order.totalAmount?.toLocaleString()}</span>
                                    <div className="w-10 h-10 rounded-full bg-secondary-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-secondary-200 text-secondary-600 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-1">
                        {currentPage > 3 && totalPages > 5 && (
                            <>
                                <button
                                    onClick={() => handlePageClick(1)}
                                    className="px-3 py-1 rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-50 transition-colors"
                                >
                                    1
                                </button>
                                <span className="px-2 text-secondary-400">...</span>
                            </>
                        )}
                        
                        {getPageNumbers().map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageClick(page)}
                                className={clsx(
                                    "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                                    page === currentPage
                                        ? "bg-primary-600 text-white"
                                        : "text-secondary-600 hover:bg-secondary-50"
                                )}
                            >
                                {page}
                            </button>
                        ))}

                        {currentPage < totalPages - 2 && totalPages > 5 && (
                            <>
                                <span className="px-2 text-secondary-400">...</span>
                                <button
                                    onClick={() => handlePageClick(totalPages)}
                                    className="px-3 py-1 rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-50 transition-colors"
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                    </div>

                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-secondary-200 text-secondary-600 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

