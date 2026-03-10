import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { ShieldAlert, Clock, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AuditLog {
    _id: string;
    action: string;
    performedBy: {
        username: string;
        email: string;
        role: string;
    };
    targetModel: string;
    targetId: string;
    department: string;
    details: any;
    timestamp: string;
}

const AdminAuditLogs = () => {
    const { token } = useContext(AuthContext)!;
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filterAction, setFilterAction] = useState('ALL');
    const [filterRole, setFilterRole] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchLogs(1); // Reset to page 1 on filter change
    }, [filterAction, filterRole, startDate, endDate, token]);

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const fetchLogs = async (pageNum: number) => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Build query params
            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: '20'
            });
            if (filterAction !== 'ALL') params.append('action', filterAction);
            if (filterRole !== 'ALL') params.append('role', filterRole);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const { data } = await axios.get(`${API}/api/users/audit-logs?${params.toString()}`, config);
            setLogs(data.logs);
            setTotalPages(data.pages);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('DELETE') || action.includes('REMOVE')) return 'bg-red-50 text-red-700 border-red-200';
        if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-amber-50 text-amber-700 border-amber-200';
        if (action.includes('CREATE') || action.includes('ADD')) return 'bg-green-50 text-green-700 border-green-200';
        return 'bg-blue-50 text-blue-700 border-blue-200';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-display text-gray-900 flex items-center gap-3">
                        <ShieldAlert className="w-7 h-7 text-indigo-600" />
                        System Audit Logs
                    </h1>
                    <p className="text-gray-500 mt-1">Track administrative actions and security events across the platform.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Action Type</label>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-indigo-500"
                    >
                        <option value="ALL">All Actions</option>
                        <option value="CREATE">Create / Add</option>
                        <option value="UPDATE">Update / Edit</option>
                        <option value="DELETE">Delete / Remove</option>
                        <option value="LOGIN">Login</option>
                        <option value="DB_BACKUP">Database Backup</option>
                        <option value="DB_RESTORE">Database Restore</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">User Role</label>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-indigo-500"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="hod">HOD</option>
                        <option value="staff">Staff</option>
                        <option value="student">Student</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                <th className="px-6 py-4 font-semibold">Timeline</th>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Action</th>
                                <th className="px-6 py-4 font-semibold">Context</th>
                                <th className="px-6 py-4 font-semibold">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                        <p className="mt-4 text-sm font-medium">Loading security trails...</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                                        No audit logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">{new Date(log.timestamp).toLocaleDateString()}</span>
                                                <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                    {log.performedBy?.username?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{log.performedBy?.username || 'System'}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{log.performedBy?.role || 'Service'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getActionColor(log.action)}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="text-gray-900 font-medium">{log.targetModel}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[150px]" title={log.targetId}>{log.targetId ? `ID: ${log.targetId}` : 'Bulk/System'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500 max-w-xs overflow-hidden text-ellipsis bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <pre className="whitespace-pre-wrap font-mono text-[10px] leading-tight text-gray-600">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <span className="text-sm text-gray-500">
                            Showing page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAuditLogs;
