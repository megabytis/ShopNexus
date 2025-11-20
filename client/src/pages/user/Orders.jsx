import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { Loader2, Package, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await ordersAPI.getMyOrders();
                setOrders(res.data.orders || []);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (orders.length === 0) {
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
            <h1 className="text-3xl font-display font-bold text-secondary-900 mb-8">My Orders</h1>

            <div className="space-y-6">
                {orders.map((order, index) => (
                    <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link
                            to={`/orders/${order._id}`}
                            className="block bg-white rounded-2xl border border-secondary-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                        >
                            <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="font-mono text-sm text-secondary-500 bg-secondary-50 px-2 py-1 rounded">#{order._id.slice(-8)}</span>
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                            {
                                                'bg-yellow-100 text-yellow-800': order.orderStatus === 'processing',
                                                'bg-blue-100 text-blue-800': order.orderStatus === 'shipped',
                                                'bg-green-100 text-green-800': order.orderStatus === 'delivered',
                                                'bg-red-100 text-red-800': order.orderStatus === 'cancelled',
                                            }
                                        )}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-secondary-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                        <div>
                                            {order.items?.length} items
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                    <span className="text-xl font-bold text-secondary-900">₹{order.totalAmount}</span>
                                    <div className="w-10 h-10 rounded-full bg-secondary-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
