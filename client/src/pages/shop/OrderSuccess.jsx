import { Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderSuccess() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8"
            >
                <CheckCircle className="h-12 w-12 text-green-600" />
            </motion.div>
            
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-display font-bold text-secondary-900 mb-4"
            >
                Order Placed Successfully!
            </motion.h1>
            
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-secondary-500 max-w-md mb-12 text-lg"
            >
                Thank you for your purchase. Your order is being processed and will be shipped soon.
            </motion.p>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <Link 
                    to="/orders/my" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-secondary-900 text-white rounded-xl font-bold hover:bg-secondary-800 transition-all transform hover:-translate-y-1 shadow-lg"
                >
                    <Package className="mr-2 h-5 w-5" />
                    View My Orders
                </Link>
                <Link 
                    to="/" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-secondary-900 border border-secondary-200 rounded-xl font-bold hover:bg-secondary-50 transition-all"
                >
                    Continue Shopping
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </motion.div>
        </div>
    );
}
