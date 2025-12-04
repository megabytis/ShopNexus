import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminProductsAPI, categoriesAPI } from '../../services/api';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image: ''
    });

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await adminProductsAPI.getOne(id);
            const product = response.data.product || response.data;
            setFormData({
                name: product.title || product.name || '',
                description: product.description || '',
                price: product.price || '',
                stock: product.stock || '',
                category: product.category?._id || product.category || '',
                image: product.image || ''
            });
        } catch (error) {
            console.error('Failed to fetch product:', error);
            toast.error('Failed to load product');
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                title: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category: formData.category,
                image: formData.image
            };

            if (isEditing) {
                await adminProductsAPI.update(id, payload);
                toast.success('Product updated successfully');
            } else {
                await adminProductsAPI.create(payload);
                toast.success('Product created successfully');
            }
            navigate('/admin/products');
        } catch (error) {
            console.error('Failed to save product:', error);
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/products')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isEditing ? 'Update product information' : 'Fill in the details below'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                {/* Product Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g. Premium Wireless Headphones"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="Describe your product..."
                    />
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Price (₹) *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Stock Quantity *
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            min="0"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Image URL */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Image URL
                    </label>
                    <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                    />
                    {formData.image && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                            <img 
                                src={formData.image} 
                                alt="Product preview"
                                className="w-full h-48 object-cover rounded-xl border border-gray-200"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
