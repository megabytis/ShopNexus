import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function AdminRoute({ children }) {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}
