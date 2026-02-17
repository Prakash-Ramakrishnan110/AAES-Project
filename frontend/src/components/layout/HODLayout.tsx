import { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const HODLayout = () => {
    const { logout, user } = useContext(AuthContext)!;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-teal-900 text-white flex flex-col">
                <div className="p-4 text-center font-bold text-xl border-b border-teal-700">
                    AAES HOD
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/hod/dashboard" className="block px-4 py-2 hover:bg-teal-700 rounded transition">Dashboard</Link>
                    <Link to="/hod/staff" className="block px-4 py-2 hover:bg-teal-700 rounded transition">Staff</Link>
                    <Link to="/hod/students" className="block px-4 py-2 hover:bg-teal-700 rounded transition">Students</Link>
                    <Link to="/hod/subjects" className="block px-4 py-2 hover:bg-teal-700 rounded transition">Subjects</Link>
                    <Link to="/hod/analytics" className="block px-4 py-2 hover:bg-teal-700 rounded transition">Analytics</Link>
                </nav>
                <div className="p-4 border-t border-teal-700">
                    <div className="text-sm mb-2">Logged in as: {user?.username}</div>
                    <div className="text-xs mb-2 text-teal-300">{user?.department} Department</div>
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
                    <h2 className="text-xl font-semibold text-gray-800">Department Portal</h2>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default HODLayout;
