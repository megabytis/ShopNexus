import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { Loader2, ArrowLeft, Package, Truck, CheckCircle, XCircle, Calendar, MapPin, CreditCard, Box, PackageCheck } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function OrderDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await ordersAPI.getOne(id);
                setOrder(res.data.order);
            } catch (error) {
                console.error('Failed to fetch order', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!order) return null;

    const steps = [
        { id: 'confirmed', label: 'Confirmed', icon: CheckCircle, date: order.orderTimeline?.confirmedAt },
        { id: 'packed', label: 'Packed', icon: Box, date: order.orderTimeline?.packedAt },
        { id: 'shipped', label: 'Shipped', icon: Truck, date: order.orderTimeline?.shippedAt },
        { id: 'delivered', label: 'Delivered', icon: PackageCheck, date: order.orderTimeline?.deliveredAt },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === order.orderStatus);
    const isCancelled = order.orderStatus === 'cancelled';

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <Link to="/orders/my" className="text-sm font-medium text-secondary-500 hover:text-primary-600 inline-flex items-center gap-2 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Orders
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-sm border border-secondary-100 overflow-hidden"
                    >
                        <div className="p-8 border-b border-secondary-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-display font-bold text-secondary-900">Order #{order._id.slice(-8)}</h1>
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
                                </div>
                                <p className="text-secondary-500 text-sm flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="p-8 bg-secondary-50/50">
                            {isCancelled ? (
                                <div className="flex items-center gap-4 text-red-700 bg-red-50 p-6 rounded-2xl border border-red-100">
                                    <XCircle className="h-8 w-8 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-lg">Order Cancelled</h3>
                                        <p className="text-sm text-red-600 mt-1">This order has been cancelled. If you have questions, please contact support.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="absolute top-5 left-0 w-full h-1 bg-secondary-200 z-0" />
                                    <div className="relative z-10 flex justify-between">
                                        {steps.map((step, index) => {
                                            const Icon = step.icon;
                                            const isCompleted = index <= currentStepIndex;
                                            const isCurrent = index === currentStepIndex;

                                            return (
                                                <div key={step.id} className="flex flex-col items-center">
                                                    <div className={clsx(
                                                        "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                                                        isCompleted ? "bg-primary-600 border-primary-100 text-white shadow-lg shadow-primary-900/20" : "bg-white border-secondary-200 text-secondary-300"
                                                    )}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <span className={clsx(
                                                        "mt-3 text-sm font-bold transition-colors",
                                                        isCompleted ? "text-primary-700" : "text-secondary-400"
                                                    )}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-secondary-100">
                            {order.items.map((item, index) => (
                                <div key={index} className="p-6 flex items-center gap-6 hover:bg-secondary-50/50 transition-colors">
                                    <div className="w-20 h-20 bg-secondary-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-secondary-400">
                                        <Package className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Product</p>
                                        <h3 className="font-bold text-secondary-900 text-lg">ID: {item.productId}</h3>
                                        <p className="text-sm text-secondary-500 mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-secondary-900 text-lg">₹{item.priceAtPurchase}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl shadow-sm border border-secondary-100 p-6"
                    >
                        <h3 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary-600" /> Payment Info
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-secondary-500">Method</span>
                                <span className="font-medium text-secondary-900">Credit Card</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary-500">Status</span>
                                <span className={clsx(
                                    "font-medium capitalize",
                                    order.paymentStatus === 'paid' ? 'text-green-600' : 
                                    order.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                )}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-secondary-100 flex justify-between items-center">
                                <span className="font-bold text-secondary-900">Total</span>
                                <span className="font-bold text-xl text-primary-600">₹{order.totalAmount}</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-3xl shadow-sm border border-secondary-100 p-6"
                    >
                        <h3 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary-600" /> Shipping Address
                        </h3>
                        <p className="text-sm text-secondary-500 leading-relaxed">
                            {order.shippingAddress?.fullName}<br />
                            {order.shippingAddress?.addressLine1}<br />
                            {order.shippingAddress?.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
                            {order.shippingAddress?.country}
                        </p>
                    </motion.div>

                    <div className="text-center">
                        <a href="#" className="text-sm font-medium text-secondary-500 hover:text-primary-600 transition-colors">
                            Need help with this order?
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
