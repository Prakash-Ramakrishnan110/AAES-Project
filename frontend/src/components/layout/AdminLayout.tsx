import { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminLayout = () => {
    const { logout, user } = useContext(AuthContext)!;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-4 text-center font-bold text-xl border-b border-gray-700">
                    AAES Admin
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-700 rounded transition">Dashboard</Link>
                    <Link to="/admin/departments" className="block px-4 py-2 hover:bg-gray-700 rounded transition">Departments</Link>
                    <Link to="/admin/staff" className="block px-4 py-2 hover:bg-gray-700 rounded transition">Staff</Link>
                    <Link to="/admin/students" className="block px-4 py-2 hover:bg-gray-700 rounded transition">Students</Link>
                    <Link to="/admin/subjects" className="block px-4 py-2 hover:bg-indigo-700 rounded transition">Subjects</Link>
                    <Link to="/admin/bulk-upload" className="block px-4 py-2 hover:bg-indigo-700 rounded transition">Bulk Upload</Link>
                    <Link to="/admin/analytics" className="block px-4 py-2 hover:bg-indigo-700 rounded transition">Analytics</Link>
                    <Link to="/admin/semester-transition" className="block px-4 py-2 hover:bg-gray-700 rounded transition">Semester Transition</Link>
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <div className="text-sm mb-2">Logged in as: {user?.username}</div>
                    <button
                        onClick={logout}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
