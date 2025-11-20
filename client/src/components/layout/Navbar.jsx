import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { ShoppingBag, User, LogOut, Menu, X, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const { totalItems } = useCartStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
        }
    };

    const navLinks = [
        { name: 'Shop', path: '/' },
        { name: 'New Arrivals', path: '/?sort=createdAt' },
        { name: 'Best Sellers', path: '/?sort=rating' }, // Assuming rating sort exists or placeholder
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={clsx(
                    "fixed top-0 left-0 right-0 z-[1000] transition-all duration-300",
                    isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-secondary-200/50" : "bg-transparent"
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white shadow-lg group-hover:shadow-primary-500/30 transition-all duration-300">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-900 to-primary-600">
                                ShopNexus
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="text-sm font-medium text-secondary-600 hover:text-primary-600 transition-colors relative group"
                                >
                                    {link.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="p-2 text-secondary-600 hover:text-primary-600 transition-colors hover:bg-secondary-100 rounded-full"
                            >
                                <Search className="h-5 w-5" />
                            </button>

                            <Link
                                to="/cart"
                                className="relative p-2 text-secondary-600 hover:text-primary-600 transition-colors hover:bg-secondary-100 rounded-full"
                            >
                                <ShoppingBag className="h-5 w-5" />
                                {totalItems > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full min-w-[18px] h-[18px] border-2 border-white">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>

                            {isAuthenticated ? (
                                <div className="relative group">
                                    <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-secondary-100 transition-colors border border-transparent hover:border-secondary-200">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-secondary-500" />
                                    </button>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-secondary-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                                        <div className="px-4 py-3 border-b border-secondary-100 bg-secondary-50">
                                            <p className="text-sm font-medium text-secondary-900 truncate">{user?.name}</p>
                                            <p className="text-xs text-secondary-500 truncate">{user?.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link to="/orders/my" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700">
                                                My Orders
                                            </Link>
                                            {user?.role === 'admin' && (
                                                <Link to="/admin" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700">
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <LogOut className="h-4 w-4" /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="text-sm font-medium text-secondary-700 hover:text-primary-600 px-3 py-2"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 text-secondary-600 hover:text-primary-600"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Bar Overlay */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-white border-b border-secondary-200 overflow-hidden"
                        >
                            <div className="max-w-7xl mx-auto px-4 py-4">
                                <form onSubmit={handleSearch} className="relative">
                                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-secondary-400" />
                                    <input
                                        type="text"
                                        placeholder="Search for products..."
                                        className="w-full pl-12 pr-4 py-3 bg-secondary-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-2xl font-display font-medium text-secondary-900"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <hr className="border-secondary-100" />
                            {!isAuthenticated && (
                                <div className="flex flex-col gap-4">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-lg font-medium text-secondary-600"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-lg font-medium text-primary-600"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
