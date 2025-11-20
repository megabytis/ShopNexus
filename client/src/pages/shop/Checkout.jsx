import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkoutAPI } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { Loader2, CreditCard, ShieldCheck, Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Checkout() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
    });
    const navigate = useNavigate();
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await checkoutAPI.summary();
                setSummary(res.data);
            } catch (error) {
                console.error('Failed to fetch summary', error);
                toast.error('Failed to load checkout summary');
                navigate('/cart');
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [navigate]);

    const validatePostalCode = (postalCode, country) => {
        const patterns = {
            'India': /^[1-9][0-9]{5}$/,
            'United States': /^\d{5}(-\d{4})?$/,
            'United Kingdom': /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
            'Canada': /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
            'Australia': /^\d{4}$/,
            'Germany': /^\d{5}$/,
            'France': /^\d{5}$/,
            'Japan': /^\d{3}-?\d{4}$/,
            'China': /^\d{6}$/,
            'Brazil': /^\d{5}-?\d{3}$/,
            'Mexico': /^\d{5}$/,
            'Singapore': /^\d{6}$/,
            'United Arab Emirates': /^\d{5}$/,
            'Saudi Arabia': /^\d{5}$/,
            'South Africa': /^\d{4}$/,
        };

        const pattern = patterns[country];
        if (!pattern) return true; // If country not in list, skip validation
        return pattern.test(postalCode.trim());
    };

    const handlePayment = async () => {
        setProcessing(true);
        // Validate Address
        if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
            toast.error('Please fill in all required shipping address fields');
            setProcessing(false);
            return;
        }

        // Validate Postal Code Format
        if (!validatePostalCode(shippingAddress.postalCode, shippingAddress.country)) {
            toast.error(`Invalid postal code format for ${shippingAddress.country}. Please check and try again.`);
            setProcessing(false);
            return;
        }

        try {
            await checkoutAPI.pay({ shippingAddress });
            toast.success('Payment successful! Order placed.');
            clearCart();
            navigate('/orders/my');
        } catch (error) {
            console.error('Payment failed', error);
            toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!summary) return null;

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-display font-bold text-secondary-900 mb-2">Secure Checkout</h1>
                <div className="flex items-center justify-center gap-2 text-secondary-500 text-sm">
                    <Lock className="h-4 w-4" />
                    <span>256-bit SSL Encrypted Payment</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Shipping Address Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-3xl shadow-xl border border-secondary-100 p-8"
                >
                    <h2 className="text-xl font-bold text-secondary-900 mb-6">Shipping Address</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="John Doe"
                                className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={shippingAddress.fullName}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Address Line 1</label>
                            <input
                                type="text"
                                required
                                placeholder="123 Main Street"
                                className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={shippingAddress.addressLine1}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Address Line 2 (Optional)</label>
                            <input
                                type="text"
                                placeholder="Apartment, suite, etc."
                                className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={shippingAddress.addressLine2}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">City</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="New Delhi"
                                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    value={shippingAddress.city}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">State</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Delhi"
                                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    value={shippingAddress.state}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Postal Code</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={
                                        shippingAddress.country === 'India' ? 'e.g., 110001' :
                                            shippingAddress.country === 'United States' ? 'e.g., 12345' :
                                                shippingAddress.country === 'United Kingdom' ? 'e.g., SW1A 1AA' :
                                                    shippingAddress.country === 'Canada' ? 'e.g., K1A 0B1' :
                                                        'Enter postal code'
                                    }
                                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    value={shippingAddress.postalCode}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                />
                                {shippingAddress.country && (
                                    <p className="text-xs text-secondary-500 mt-1">
                                        {shippingAddress.country === 'India' && 'Format: 6 digits (e.g., 110001)'}
                                        {shippingAddress.country === 'United States' && 'Format: 5 or 9 digits (e.g., 12345 or 12345-6789)'}
                                        {shippingAddress.country === 'United Kingdom' && 'Format: UK postcode (e.g., SW1A 1AA)'}
                                        {shippingAddress.country === 'Canada' && 'Format: A1A 1A1'}
                                        {shippingAddress.country === 'Australia' && 'Format: 4 digits (e.g., 2000)'}
                                        {!['India', 'United States', 'United Kingdom', 'Canada', 'Australia'].includes(shippingAddress.country) && 'Enter valid postal code for your country'}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Country</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                    value={shippingAddress.country}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                >
                                    <option value="">Select Country</option>
                                    <option value="India">India</option>
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Australia">Australia</option>
                                    <option value="Germany">Germany</option>
                                    <option value="France">France</option>
                                    <option value="Japan">Japan</option>
                                    <option value="China">China</option>
                                    <option value="Brazil">Brazil</option>
                                    <option value="Mexico">Mexico</option>
                                    <option value="Singapore">Singapore</option>
                                    <option value="UAE">United Arab Emirates</option>
                                    <option value="Saudi Arabia">Saudi Arabia</option>
                                    <option value="South Africa">South Africa</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </motion.div>

                {/* Order Summary & Payment */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <div className="bg-white rounded-3xl shadow-xl border border-secondary-100 overflow-hidden">
                        <div className="p-8 border-b border-secondary-100 bg-secondary-50/50">
                            <h2 className="text-xl font-bold text-secondary-900 mb-6">Order Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-secondary-600">
                                    <span>Total Items</span>
                                    <span className="font-medium text-secondary-900">{summary.totalItems}</span>
                                </div>
                                <div className="flex justify-between items-center text-secondary-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-secondary-900">₹{summary.amount}</span>
                                </div>
                                <div className="flex justify-between items-center text-secondary-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="pt-6 border-t border-secondary-200 flex justify-between items-center">
                                    <span className="text-xl font-bold text-secondary-900">Total Amount</span>
                                    <span className="text-3xl font-bold text-primary-600">₹{summary.amount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <h3 className="text-lg font-bold text-secondary-900 mb-6">Payment Method</h3>

                            <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4 mb-8 flex items-center gap-4 cursor-pointer ring-2 ring-primary-500 ring-offset-2">
                                <div className="w-12 h-8 bg-white rounded border border-secondary-200 flex items-center justify-center">
                                    <CreditCard className="h-5 w-5 text-secondary-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-secondary-900">Credit / Debit Card</p>
                                    <p className="text-xs text-secondary-500">Secure payment via Stripe (Dummy)</p>
                                </div>
                                <CheckCircle className="h-6 w-6 text-primary-600 fill-primary-50" />
                            </div>

                            <div className="flex items-center gap-3 mb-8 text-sm text-secondary-600 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                <p>This is a secure dummy payment environment. No actual money will be deducted from your account.</p>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-3 bg-primary-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all transform hover:-translate-y-1 shadow-lg shadow-primary-900/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-5 w-5" />
                                        Pay ₹{summary.amount} Securely
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => navigate('/cart')}
                    className="text-secondary-500 hover:text-secondary-900 font-medium text-sm"
                >
                    Cancel and return to cart
                </button>
            </div>
        </div>
    );
}
