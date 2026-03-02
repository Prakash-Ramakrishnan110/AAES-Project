import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdvisorReports = () => {
    const { token } = useContext(AuthContext)!;
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const API = 'http://localhost:5000';

    const handleExport = async () => {
        setLoading(true);
        setSuccess(false);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.get(`${API}/api/advisor/report-data`, config);

            // Mock download delay
            setTimeout(() => {
                setLoading(false);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }, 1500);
        } catch (err) {
            console.error(err);
            setLoading(false);
            alert('Failed to generate report.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Class Reports</h1>
                    <p className="text-gray-500 text-sm">Generate and export comprehensive class performance and attendance reports.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                >
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <FileText className="w-7 h-7 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Academic Performance Report</h3>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                        Comprehensive PDF report including subject-wise averages, highest/lowest marks,
                        and student performance distribution for the current academic year.
                    </p>
                    <button
                        onClick={() => handleExport()}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : <><Download className="w-4 h-4" /> Export as PDF</>}
                    </button>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-xl transition-all group"
                >
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <FileText className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Attendance & Risk Analysis</h3>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                        Excel spreadsheet containing detailed attendance percentages, identification of at-risk students,
                        and contact information for mentorship followup.
                    </p>
                    <button
                        onClick={() => handleExport()}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : <><Download className="w-4 h-4" /> Export as Excel</>}
                    </button>
                </motion.div>
            </div>

            {success && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-10 right-10 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md"
                >
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Report Generated!</p>
                        <p className="text-[10px] text-gray-400">Download should start automatically.</p>
                    </div>
                </motion.div>
            )}

            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 flex items-start gap-4 mt-8">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-900">Data Privacy Note</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                        These reports contain sensitive student data. Please ensure they are handled in accordance with the
                        institution's data protection policies and only shared with authorized personnel.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdvisorReports;
