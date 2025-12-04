import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkoutAPI, api } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ summary, shippingAddress, setShippingAddress }) => {
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();
    const clearCart = useCartStore((state) => state.clearCart);
    const stripe = useStripe();
    const elements = useElements();

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
            'Singapore': /^\d{6}$/,
        };
        const pattern = patterns[country];
        if (!pattern) return true;
        return pattern.test(postalCode.trim());
    };

    const handlePayment = async () => {
        if (!stripe || !elements) return;

        setProcessing(true);

        if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || 
            !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
            toast.error('Please fill in all required shipping address fields');
            setProcessing(false);
            return;
        }

        if (!validatePostalCode(shippingAddress.postalCode, shippingAddress.country)) {
            toast.error(`Invalid postal code format for ${shippingAddress.country}`);
            setProcessing(false);
            return;
        }

        try {
            const result = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order-success`,
                },
                redirect: 'if_required',
            });

            if (result.error) {
                toast.error(result.error.message);
            } else if (result.paymentIntent?.status === 'succeeded') {
                toast.success('Payment successful! Order placed.');
                await clearCart();
                navigate('/order-success');
            } else if (result.paymentIntent?.status === 'requires_action') {
                toast.loading('Complete the payment in your UPI app...');
            }
        } catch (error) {
            console.error('Payment failed', error);
            toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
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
                                placeholder="110001"
                                className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={shippingAddress.postalCode}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                            />
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
                                <option value="Singapore">Singapore</option>
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
                        
                        {/* Stripe Payment Element - Shows Card + UPI */}
                        <div className="mb-6">
                            <PaymentElement options={{ layout: 'tabs' }} />
                        </div>

                        <div className="flex items-center gap-3 mb-6 text-sm text-secondary-600 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <p>Secure payment. Test mode – use card <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code></p>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={processing || !stripe}
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
    );
};

export default function Checkout() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clientSecret, setClientSecret] = useState(null);
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

    useEffect(() => {
        const initCheckout = async () => {
            try {
                const summaryRes = await checkoutAPI.summary();
                setSummary(summaryRes.data);
            } catch (error) {
                console.error('Failed to init checkout', error);
                toast.error('Failed to load checkout');
                navigate('/cart');
            } finally {
                setLoading(false);
            }
        };
        initCheckout();
    }, [navigate]);

    // Create PaymentIntent when address is filled
    useEffect(() => {
        const createPaymentIntent = async () => {
            if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || 
                !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
                return;
            }

            try {
                const { data } = await api.post('/create-payment-intent', { shippingAddress });
                setClientSecret(data.clientSecret);
            } catch (error) {
                console.error('Failed to create payment intent', error);
                toast.error('Failed to initialize payment');
            }
        };

        const debounceTimer = setTimeout(createPaymentIntent, 500);
        return () => clearTimeout(debounceTimer);
    }, [shippingAddress]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!summary) return null;

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#6366f1',
            borderRadius: '12px',
        },
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-display font-bold text-secondary-900 mb-2">Secure Checkout</h1>
                <div className="flex items-center justify-center gap-2 text-secondary-500 text-sm">
                    <Lock className="h-4 w-4" />
                    <span>256-bit SSL Encrypted Payment</span>
                </div>
            </div>

            {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                    <CheckoutForm 
                        summary={summary} 
                        shippingAddress={shippingAddress}
                        setShippingAddress={setShippingAddress}
                    />
                </Elements>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Address Form before payment is ready */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-3xl shadow-xl border border-secondary-100 p-8"
                    >
                        <h2 className="text-xl font-bold text-secondary-900 mb-2">Shipping Address</h2>
                        <p className="text-secondary-500 text-sm mb-6">Fill in your address to proceed to payment</p>
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
                                        placeholder="110001"
                                        className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        value={shippingAddress.postalCode}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                    />
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
                                        <option value="Singapore">Singapore</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
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
                                <div className="text-center text-secondary-500 py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary-600" />
                                    <p>Complete shipping address to load payment options</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

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
