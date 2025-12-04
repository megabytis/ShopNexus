import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api, cartAPI } from '../services/api';
import toast from 'react-hot-toast';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const fetchCartTotal = async () => {
        try {
            const res = await cartAPI.get();
            // Assuming cart response has totalAmount or items to calculate
            // Adjust based on actual cart response structure
            if (res.data && res.data.totalAmount) {
                setAmount(res.data.totalAmount * 100); // Stripe expects cents
            } else if (res.data && res.data.cart && res.data.cart.totalAmount) {
                 setAmount(res.data.cart.totalAmount * 100);
            }
        } catch (err) {
            console.error("Failed to fetch cart", err);
        }
    };
    fetchCartTotal();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create PaymentIntent on backend
      // Use the amount from state, or fallback to a default for testing if 0
      const paymentAmount = amount > 0 ? amount : 100; // Default 1 INR if 0

      const { data } = await api.post('/create-payment-intent', {
        amount: paymentAmount,
      });

      const { clientSecret } = data;

      // 2. Confirm the payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        toast.error(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
        toast.success('Payment successful!');
        // Optionally call backend to create order here
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Payment failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <p>Payment successful!</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
    </form>
  );
};

export default CheckoutForm;
