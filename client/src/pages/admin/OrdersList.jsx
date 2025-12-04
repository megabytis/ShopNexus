import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminOrdersAPI } from '../../services/api';
import { Loader2, ShoppingBag, Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await adminOrdersAPI.getAll({ limit: 100 });
            setOrders(response.data.allOrders || response.data.orders || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        const statusMap = {
            'pending': 'bg-gray-100 text-gray-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'packed': 'bg-indigo-100 text-indigo-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const statusMap = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'paid': 'bg-green-100 text-green-800',
            'failed': 'bg-red-100 text-red-800'
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600 mt-1">{orders.length} total orders</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-semibold text-gray-900">
                                                #{order._id.slice(-8)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {order.userId?.name || 'Customer'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {order.userId?.email || `ID: ${order.userId}`}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-gray-900">
                                                ₹{order.totalAmount?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                {order.paymentStatus || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/admin/orders/${order._id}`}
                                                className="inline-flex items-center gap-2 p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-5 h-5" />
                                                <span className="hidden sm:inline">View</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-gray-500">
                                            {searchTerm ? 'No orders found' : 'No orders yet'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
