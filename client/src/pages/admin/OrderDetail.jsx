import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminOrdersAPI } from '../../services/api';
import { 
    Loader2, 
    ArrowLeft, 
    Package, 
    MapPin, 
    CreditCard,
    User,
    Clock,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const response = await adminOrdersAPI.getOne(id);
            setOrder(response.data.order || response.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
            toast.error('Failed to load order details');
            navigate('/admin/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            await adminOrdersAPI.updateStatus(id, { orderStatus: newStatus });
            toast.success('Order status updated successfully');
            fetchOrder();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!order) {
        return null;
    }

    const currentStatusIndex = ORDER_STATUSES.indexOf(order.orderStatus);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Order #{order._id.slice(-8)}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>

            {/* Order Status Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Order Progress</h2>
                <div className="relative">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
                        <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                            style={{ width: `${(currentStatusIndex / (ORDER_STATUSES.length - 1)) * 100}%` }}
                        />
                    </div>
                    <div className="relative grid grid-cols-5 gap-2">
                        {ORDER_STATUSES.map((status, index) => {
                            const isCompleted = index <= currentStatusIndex;
                            const isCurrent = index === currentStatusIndex;
                            
                            return (
                                <div key={status} className="flex flex-col items-center">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                                        ${isCompleted 
                                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg' 
                                            : 'bg-gray-200 text-gray-400'
                                        }
                                        ${isCurrent ? 'ring-4 ring-purple-200 scale-110' : ''}
                                    `}>
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-current" />
                                        )}
                                    </div>
                                    <p className={`text-xs font-medium text-center capitalize ${
                                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                                    }`}>
                                        {status}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Update Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Update Order Status:</p>
                    <div className="flex flex-wrap gap-2">
                        {ORDER_STATUSES.map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusUpdate(status)}
                                disabled={updating || status === order.orderStatus}
                                className={`
                                    px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize
                                    ${status === order.orderStatus
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-bold text-gray-900">Customer Information</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-semibold text-gray-900">
                                {order.userId?.name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-semibold text-gray-900">
                                {order.userId?.email || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-semibold text-gray-900">
                                {order.shippingAddress?.phone || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <MapPin className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-gray-900">
                            {order.shippingAddress?.street || 'N/A'}
                        </p>
                        <p className="text-gray-600">
                            {order.shippingAddress?.city}, {order.shippingAddress?.state}
                        </p>
                        <p className="text-gray-600">
                            {order.shippingAddress?.postalCode}
                        </p>
                        <p className="text-gray-600">
                            {order.shippingAddress?.country}
                        </p>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-bold text-gray-900">Payment Information</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Payment Status</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {order.paymentStatus || 'pending'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Payment Method</p>
                            <p className="font-semibold text-gray-900 capitalize">
                                {order.paymentMethod || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Timeline */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-bold text-gray-900">Timeline</h2>
                    </div>
                    <div className="space-y-3">
                        {order.confirmedAt && (
                            <div>
                                <p className="text-sm text-gray-500">Confirmed</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(order.confirmedAt).toLocaleString('en-IN')}
                                </p>
                            </div>
                        )}
                        {order.packedAt && (
                            <div>
                                <p className="text-sm text-gray-500">Packed</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(order.packedAt).toLocaleString('en-IN')}
                                </p>
                            </div>
                        )}
                        {order.shippedAt && (
                            <div>
                                <p className="text-sm text-gray-500">Shipped</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(order.shippedAt).toLocaleString('en-IN')}
                                </p>
                            </div>
                        )}
                        {order.deliveredAt && (
                            <div>
                                <p className="text-sm text-gray-500">Delivered</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(order.deliveredAt).toLocaleString('en-IN')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Package className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
                </div>
                <div className="space-y-4">
                    {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                {item.productId?.image ? (
                                    <img 
                                        src={item.productId.image} 
                                        alt={item.productId?.title || item.productId?.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                    {item.productId?.title || item.productId?.name || 'Product'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Quantity: {item.quantity}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                                <p className="text-sm text-gray-500">₹{item.price} each</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{order.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>₹{order.totalAmount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
