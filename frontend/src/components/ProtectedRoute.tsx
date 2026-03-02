import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const auth = useContext(AuthContext);

    if (!auth || !auth.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && auth.user && !allowedRoles.includes(auth.user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Student onboarding enforcement removed as per user request

    return <Outlet />;
};

export default ProtectedRoute;
