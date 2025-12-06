import { Link } from 'react-router-dom';
import { KeyRound, ShieldCheck, Package, ImageIcon, ClipboardList, Users } from 'lucide-react';

export default function DemoAdminAccess() {
    const adminUrl = 'https://shop-nexus-beta.vercel.app/admin/login';
    const demoEmail = 'admin.demo@shopnexus.com';
    const demoPassword = 'Demo@1234';

    return (
        <section className="bg-gradient-to-br from-secondary-50 to-secondary-100 py-16 px-4 sm:px-6 lg:px-8 border-t border-secondary-200">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white shadow-lg">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-secondary-900">Demo Admin Access</h2>
                    </div>
                    <p className="text-secondary-500 max-w-xl mx-auto">
                        For recruiters, interviewers, and reviewers: explore the full Admin Panel functionality using the credentials below.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-secondary-200">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Credentials */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-secondary-900 flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-primary-600" />
                                Demo Credentials
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="bg-secondary-50 rounded-lg p-3 border border-secondary-100">
                                    <span className="text-secondary-500 block text-xs uppercase tracking-wide mb-1">Admin Login URL</span>
                                    <code className="text-secondary-800 font-mono text-xs break-all">{adminUrl}</code>
                                </div>
                                <div className="bg-secondary-50 rounded-lg p-3 border border-secondary-100">
                                    <span className="text-secondary-500 block text-xs uppercase tracking-wide mb-1">Email</span>
                                    <code className="text-secondary-800 font-mono">{demoEmail}</code>
                                </div>
                                <div className="bg-secondary-50 rounded-lg p-3 border border-secondary-100">
                                    <span className="text-secondary-500 block text-xs uppercase tracking-wide mb-1">Password</span>
                                    <code className="text-secondary-800 font-mono">{demoPassword}</code>
                                </div>
                            </div>
                            <p className="text-xs text-secondary-400 italic">
                                *These demo credentials are provided for evaluation purposes only.
                            </p>
                        </div>

                        {/* What you can test */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-secondary-900">What you can test as Admin</h3>
                            <ul className="space-y-2 text-sm text-secondary-600">
                                <li className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-primary-500 flex-shrink-0" />
                                    Product CRUD operations
                                </li>
                                <li className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-primary-500 flex-shrink-0" />
                                    Image uploads (Cloudinary)
                                </li>
                                <li className="flex items-center gap-2">
                                    <ClipboardList className="h-4 w-4 text-primary-500 flex-shrink-0" />
                                    Order status workflow
                                </li>
                                <li className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary-500 flex-shrink-0" />
                                    Role-based access control
                                </li>
                            </ul>
                            <Link
                                to="/admin/login"
                                className="mt-4 inline-flex items-center justify-center w-full px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
                            >
                                Admin Login (Demo)
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-secondary-100 text-center">
                        <p className="text-xs text-secondary-400">
                            This is a functional demo project. Data may reset, and destructive actions may be limited.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
