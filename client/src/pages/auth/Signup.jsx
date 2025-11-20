import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Loader2, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const schema = yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
}).required();

export default function Signup() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            await authAPI.signup(data);
            toast.success('Account created! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="min-h-screen flex flex-row-reverse">
            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white w-full lg:w-1/2">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white shadow-lg">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-display font-bold text-secondary-900">ShopNexus</span>
                        </div>

                        <h2 className="text-3xl font-display font-bold text-secondary-900">Create an account</h2>
                        <p className="mt-2 text-sm text-secondary-600">
                            Start your journey with us today.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-8"
                    >
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700">Full Name</label>
                                <div className="mt-1">
                                    <input
                                        {...register('name')}
                                        type="text"
                                        className="appearance-none block w-full px-3 py-3 border border-secondary-300 rounded-xl shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                                        placeholder="John Doe"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700">Email address</label>
                                <div className="mt-1">
                                    <input
                                        {...register('email')}
                                        type="email"
                                        className="appearance-none block w-full px-3 py-3 border border-secondary-300 rounded-xl shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                                        placeholder="you@example.com"
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700">Password</label>
                                <div className="mt-1">
                                    <input
                                        {...register('password')}
                                        type="password"
                                        className="appearance-none block w-full px-3 py-3 border border-secondary-300 rounded-xl shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700">Confirm Password</label>
                                <div className="mt-1">
                                    <input
                                        {...register('confirmPassword')}
                                        type="password"
                                        className="appearance-none block w-full px-3 py-3 border border-secondary-300 rounded-xl shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                                        placeholder="••••••••"
                                    />
                                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                                >
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-secondary-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-secondary-500">Already have an account?</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    to="/login"
                                    className="w-full flex justify-center py-3 px-4 border border-secondary-300 rounded-xl shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 transition-all"
                                >
                                    Sign in <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Left Side - Image */}
            <div className="hidden lg:block relative w-0 flex-1">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Fashion"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-primary-900/80 to-primary-900/40 mix-blend-multiply" />
                <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
                    <div className="max-w-lg">
                        <h2 className="text-4xl font-display font-bold text-white mb-6">Join the Revolution</h2>
                        <p className="text-primary-100 text-lg leading-relaxed">
                            Experience shopping like never before. Curated styles, seamless checkout, and premium support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
