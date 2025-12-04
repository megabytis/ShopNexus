import { useState, useEffect } from 'react';
import { adminOrdersAPI, adminProductsAPI } from '../../services/api';
import { 
    TrendingUp, 
    ShoppingBag, 
    Package, 
    DollarSign,
    Loader2,
    AlertTriangle,
    ArrowUpRight,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        ordersToday: 0,
        ordersThisWeek: 0,
        ordersThisMonth: 0,
        lowStockProducts: [],
        recentOrders: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [ordersRes, productsRes] = await Promise.all([
                adminOrdersAPI.getAll({ limit: 100 }),
                adminProductsAPI.getAll({ limit: 100 })
            ]);

            const orders = ordersRes.data.allOrders || ordersRes.data.orders || [];
            const products = productsRes.data.products || productsRes.data.data || [];

            // Calculate revenue (only from paid/delivered orders)
            const totalRevenue = orders
                .filter(order => order.paymentStatus === 'paid' || order.orderStatus === 'delivered')
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            // Calculate date-based orders
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

            const ordersToday = orders.filter(order => new Date(order.createdAt) >= today).length;
            const ordersThisWeek = orders.filter(order => new Date(order.createdAt) >= weekAgo).length;
            const ordersThisMonth = orders.filter(order => new Date(order.createdAt) >= monthAgo).length;

            // Find low stock products (stock < 10)
            const lowStockProducts = products
                .filter(product => product.stock < 10)
                .slice(0, 5);

            // Get recent orders
            const recentOrders = orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            setStats({
                totalRevenue,
                totalOrders: orders.length,
                ordersToday,
                ordersThisWeek,
                ordersThisMonth,
                lowStockProducts,
                recentOrders
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            </div>
        );
    }

    const statCards = [
        {
            name: 'Total Revenue',
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            name: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingBag,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            name: 'Orders Today',
            value: stats.ordersToday,
            icon: Clock,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
        {
            name: 'Orders This Week',
            value: stats.ordersThisWeek,
            icon: TrendingUp,
            color: 'from-orange-500 to-red-600',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Welcome header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.name}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                        <Link 
                            to="/admin/orders"
                            className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                            View all
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {stats.recentOrders.length > 0 ? (
                            stats.recentOrders.map((order) => (
                                <Link
                                    key={order._id}
                                    to={`/admin/orders/${order._id}`}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">
                                            Order #{order._id?.slice(-8)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                            order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                            order.orderStatus === 'confirmed' || order.orderStatus === 'packed' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No orders yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Low Stock Products */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Low Stock Alert</h2>
                        <Link 
                            to="/admin/products"
                            className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                            View all
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {stats.lowStockProducts.length > 0 ? (
                            stats.lowStockProducts.map((product) => (
                                <div
                                    key={product._id}
                                    className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100"
                                >
                                    <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                        {product.image ? (
                                            <img 
                                                src={product.image} 
                                                alt={product.title || product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <Package className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {product.title || product.name}
                                        </p>
                                        <p className="text-sm text-gray-600">₹{product.price}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span className="font-bold">{product.stock}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>All products are well stocked</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Orders Timeline */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Orders Timeline</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-600 mb-2">Last 24 Hours</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {stats.ordersToday}
                        </p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-600 mb-2">Last 7 Days</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            {stats.ordersThisWeek}
                        </p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-600 mb-2">Last 30 Days</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            {stats.ordersThisMonth}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
