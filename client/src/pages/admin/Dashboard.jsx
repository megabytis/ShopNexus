import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI, ordersAPI } from '../../services/api';
import { Loader2, Plus, Trash2, Edit2, Package, Layers, ShoppingBag, Search, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'products') {
                const res = await productsAPI.getAll({ limit: 100 });
                setProducts(res.data.products || []);
            } else if (activeTab === 'categories') {
                const res = await categoriesAPI.getAll();
                setCategories(res.data.categories || []);
            } else if (activeTab === 'orders') {
                const res = await ordersAPI.getAll({ limit: 50 });
                setOrders(res.data.allOrders || []);
            }
        } catch (error) {
            console.error('Fetch error', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            if (activeTab === 'products') {
                await productsAPI.delete(id);
                setProducts(products.filter(p => p._id !== id));
            } else {
                await categoriesAPI.delete(id);
                setCategories(categories.filter(c => c._id !== id));
            }
            toast.success('Deleted successfully');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'products') {
                if (isEditing) {
                    await productsAPI.update(currentItem._id, formData);
                } else {
                    await productsAPI.create(formData);
                }
            } else if (activeTab === 'categories') {
                if (isEditing) {
                    await categoriesAPI.update(currentItem._id, formData);
                } else {
                    await categoriesAPI.create(formData);
                }
            }
            toast.success('Saved successfully');
            setIsEditing(false);
            setCurrentItem(null);
            setFormData({});
            fetchData();
        } catch (error) {
            toast.error('Failed to save');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await ordersAPI.updateStatus(id, { orderStatus: newStatus });
            toast.success('Order status updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const openModal = (item = null) => {
        setIsEditing(!!item);
        setCurrentItem(item);
        setFormData(item || (activeTab === 'products' ? {
            title: '', description: '', price: '', stock: '', category: '', image: ''
        } : { name: '' }));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-secondary-900">Admin Dashboard</h1>
                    <p className="text-secondary-500 mt-1">Manage your store efficiently</p>
                </div>
                {activeTab !== 'orders' && (
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-900/20 transition-all transform hover:-translate-y-0.5 font-medium"
                    >
                        <Plus className="h-5 w-5" /> Add New {activeTab === 'products' ? 'Product' : 'Category'}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-8 bg-secondary-100 p-1 rounded-xl w-fit">
                {['products', 'categories', 'orders'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={clsx(
                            "py-2 px-6 font-medium text-sm rounded-lg transition-all capitalize",
                            activeTab === tab ? "bg-white text-primary-600 shadow-sm" : "text-secondary-500 hover:text-secondary-700 hover:bg-secondary-200/50"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-secondary-100 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-secondary-100">
                            <thead className="bg-secondary-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-secondary-500 uppercase tracking-wider">
                                        {activeTab === 'products' ? 'Product' : activeTab === 'categories' ? 'Category' : 'Order ID'}
                                    </th>
                                    {activeTab === 'products' && (
                                        <>
                                            <th className="px-8 py-4 text-left text-xs font-bold text-secondary-500 uppercase tracking-wider">Price</th>
                                            <th className="px-8 py-4 text-left text-xs font-bold text-secondary-500 uppercase tracking-wider">Stock</th>
                                        </>
                                    )}
                                    {activeTab === 'orders' && (
                                        <>
                                            <th className="px-8 py-4 text-left text-xs font-bold text-secondary-500 uppercase tracking-wider">User</th>
                                            <th className="px-8 py-4 text-left text-xs font-bold text-secondary-500 uppercase tracking-wider">Total</th>
                                            <th className="px-8 py-4 text-left text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                                        </>
                                    )}
                                    <th className="px-8 py-4 text-right text-xs font-bold text-secondary-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-secondary-100">
                                {(activeTab === 'products' ? products : activeTab === 'categories' ? categories : orders).map((item) => (
                                    <tr key={item._id} className="hover:bg-secondary-50/50 transition-colors">
                                        <td className="px-8 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {activeTab === 'products' && (
                                                    <div className="h-12 w-12 flex-shrink-0 bg-secondary-100 rounded-lg overflow-hidden mr-4 flex items-center justify-center">
                                                        {item.image ? (
                                                            <img src={item.image} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Package className="h-6 w-6 text-secondary-400" />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="text-sm font-bold text-secondary-900">
                                                    {item.title || item.name || '#' + item._id.slice(-8)}
                                                </div>
                                            </div>
                                        </td>
                                        {activeTab === 'products' && (
                                            <>
                                                <td className="px-8 py-4 whitespace-nowrap text-sm text-secondary-600">₹{item.price}</td>
                                                <td className="px-8 py-4 whitespace-nowrap">
                                                    <span className={clsx(
                                                        "px-2.5 py-0.5 rounded-full text-xs font-bold",
                                                        item.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                    )}>
                                                        {item.stock}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'orders' && (
                                            <>
                                                <td className="px-8 py-4 whitespace-nowrap text-sm text-secondary-600">{item.userId}</td>
                                                <td className="px-8 py-4 whitespace-nowrap text-sm font-bold text-secondary-900">₹{item.totalAmount}</td>
                                                <td className="px-8 py-4 whitespace-nowrap">
                                                    <select
                                                        value={item.orderStatus}
                                                        onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                                                        className="text-xs font-medium border-secondary-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 py-1.5"
                                                    >
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-8 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {activeTab !== 'orders' && (
                                                <>
                                                    <button onClick={() => openModal(item)} className="text-primary-600 hover:text-primary-800 mr-4 p-2 hover:bg-primary-50 rounded-lg transition-colors">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {(isEditing || currentItem === null) && Object.keys(formData).length > 0 && activeTab !== 'orders' && (
                    <div className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-bold text-secondary-900">
                                    {isEditing ? 'Edit' : 'Create'} {activeTab === 'products' ? 'Product' : 'Category'}
                                </h2>
                                <button onClick={() => { setIsEditing(false); setCurrentItem(null); setFormData({}); }} className="p-2 hover:bg-secondary-100 rounded-full">
                                    <X className="h-5 w-5 text-secondary-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-5">
                                {activeTab === 'products' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-secondary-700 mb-1">Title</label>
                                            <input
                                                className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                value={formData.title || ''}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                                            <textarea
                                                className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                rows="3"
                                                value={formData.description || ''}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-secondary-700 mb-1">Price</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                    value={formData.price || ''}
                                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-secondary-700 mb-1">Stock</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                    value={formData.stock || ''}
                                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-secondary-700 mb-1">Image URL</label>
                                            <input
                                                className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                value={formData.image || ''}
                                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-secondary-700 mb-1">Category</label>
                                            <select
                                                className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                value={formData.category || ''}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">Category Name</label>
                                        <input
                                            className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            value={formData.name || ''}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}
                                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-secondary-100">
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditing(false); setCurrentItem(null); setFormData({}); }}
                                        className="px-6 py-2.5 text-secondary-600 hover:bg-secondary-50 rounded-xl font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-lg shadow-primary-900/20 transition-all transform hover:-translate-y-0.5"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
