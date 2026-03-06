import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { X, Save, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AssignAdvisorModalProps {
    onClose: () => void;
    advisors: any[];
    refreshData: () => void;
}

const AssignAdvisorModal = ({ onClose, advisors, refreshData }: AssignAdvisorModalProps) => {
    const { token } = useContext(AuthContext)!;
    const [staffList, setStaffList] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        academicYear: '1st Year',
        staffId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Fetch staff in the HOD's department
                const res = await axios.get(`${API}/api/users?role=staff`, config);
                setStaffList(res.data);

                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, staffId: res.data[0]._id }));
                }
            } catch (err) {
                console.error("Failed to load staff", err);
            }
        };
        fetchStaff();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API}/api/advisor/assign`, formData, config);

            setSuccess('Advisor assigned successfully!');
            refreshData();
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to assign advisor');
        } finally {
            setLoading(false);
        }
    };

    // Find if an advisor already exists for the selected year
    const existingAdvisor = advisors.find(a => a.academicYear === formData.academicYear);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Assign Class Advisor</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">Current Assignments</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(year => {
                                const adv = advisors.find(a => a.academicYear === year);
                                return (
                                    <div key={year} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                        <span className="font-medium text-gray-700">{year}</span>
                                        <span className="text-gray-500">{adv ? adv.staff.username : 'Unassigned'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-100 pt-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 flex items-start">
                                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
                                {success}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                                <select
                                    required
                                    className="w-full border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={formData.academicYear}
                                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                >
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Staff</label>
                                <select
                                    required
                                    className="w-full border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={formData.staffId}
                                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                >
                                    {staffList.map(staff => (
                                        <option key={staff._id} value={staff._id}>
                                            {staff.fullName || staff.username}
                                        </option>
                                    ))}
                                    {staffList.length === 0 && <option value="">No staff available</option>}
                                </select>
                            </div>
                        </div>

                        {existingAdvisor && existingAdvisor.staff._id !== formData.staffId && (
                            <div className="p-3 bg-yellow-50 text-yellow-800 rounded-xl text-xs border border-yellow-100 flex items-start">
                                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                Warning: {existingAdvisor.staff.username} is currently assigned to {formData.academicYear}. Proceeding will replace them.
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || staffList.length === 0}
                                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Assignment
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignAdvisorModal;
