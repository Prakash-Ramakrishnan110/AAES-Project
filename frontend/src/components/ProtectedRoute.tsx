import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const auth = useContext(AuthContext);
    const location = useLocation();

    if (!auth || !auth.isAuthenticated) {
        console.log(`[ProtectedRoute] Path ${location.pathname} - Not authenticated, redirecting to /login`);
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && auth.user && !allowedRoles.includes(auth.user.role)) {
        console.log(`[ProtectedRoute] Path ${location.pathname} - Role mismatch. User role: ${auth.user.role}, Allowed: ${allowedRoles}. Redirecting to /unauthorized`);
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
