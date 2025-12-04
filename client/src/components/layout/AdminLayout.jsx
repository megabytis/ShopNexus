import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingBag, 
    LogOut, 
    Menu, 
    X,
    User
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
];

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                <LayoutDashboard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">ShopNexus</h1>
                                <p className="text-xs text-gray-500">Admin Panel</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href || 
                                           (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));
                            
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                                        ${isActive 
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info & Logout */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top navbar */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6 text-gray-600" />
                        </button>
                        
                        <div className="flex-1 lg:flex-none">
                            <h2 className="text-xl font-bold text-gray-900">
                                {navigation.find(item => 
                                    location.pathname === item.href || 
                                    (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href))
                                )?.name || 'Admin Panel'}
                            </h2>
                        </div>

                        <div className="hidden lg:flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
