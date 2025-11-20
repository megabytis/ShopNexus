import { Link } from 'react-router-dom';
import { ShoppingBag, Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-secondary-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-display font-bold">ShopNexus</span>
                        </Link>
                        <p className="text-secondary-400 text-sm leading-relaxed">
                            Experience the future of shopping. Curated collections, premium quality, and seamless delivery right to your doorstep.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors"><Youtube className="h-5 w-5" /></a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-display font-semibold text-lg mb-6">Shop</h3>
                        <ul className="space-y-3 text-secondary-400 text-sm">
                            <li><Link to="/" className="hover:text-primary-400 transition-colors">New Arrivals</Link></li>
                            <li><Link to="/" className="hover:text-primary-400 transition-colors">Best Sellers</Link></li>
                            <li><Link to="/" className="hover:text-primary-400 transition-colors">Categories</Link></li>
                            <li><Link to="/" className="hover:text-primary-400 transition-colors">Sale</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display font-semibold text-lg mb-6">Support</h3>
                        <ul className="space-y-3 text-secondary-400 text-sm">
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Shipping & Returns</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Size Guide</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-display font-semibold text-lg mb-6">Stay Updated</h3>
                        <p className="text-secondary-400 text-sm mb-4">Subscribe to our newsletter for exclusive offers and updates.</p>
                        <form className="flex flex-col gap-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-secondary-500" />
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full bg-secondary-800 border border-secondary-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-primary-900/20">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-secondary-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-secondary-500 text-sm">© 2025 ShopNexus. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-secondary-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
