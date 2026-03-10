import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { FileText, Download, AlertCircle, Search, Filter, Printer, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

const AdvisorReports = () => {
    const { token, user } = useContext(AuthContext)!;
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [filters, setFilters] = useState({
        department: user?.role === 'staff' ? (user.advisorDepartment || user.department || '') : (user?.department || ''),
        academicYear: user?.role === 'staff' ? (user.advisorYear || '') : (user?.academicYear || ''),
        semester: '',
        section: '',
        month: '',
        reportType: 'internal' // 'internal' or 'attendance'
    });

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchReportData = async () => {
        if (!filters.semester || !filters.section || !filters.academicYear) {
            alert('Please select Academic Year, Semester and Section');
            return;
        }
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: filters
            };
            const res = await axios.get(`${API}/api/advisor/consolidated-report-data`, config);
            setReportData(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch report data.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (type: 'excel' | 'pdf') => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: filters,
                responseType: 'blob' as const
            };
            const endpoint = type === 'excel' ? 'download-excel' : 'download-pdf';
            const res = await axios.get(`${API}/api/reports/${endpoint}`, config);

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filters.reportType}_Report_${filters.section}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            alert(`Failed to download ${type.toUpperCase()} report.`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Filter className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Report Filters</h2>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-2xl">
                        <button
                            onClick={() => setFilters({ ...filters, reportType: 'internal' })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filters.reportType === 'internal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <BookOpen className="w-4 h-4" /> Internal Marks
                        </button>
                        <button
                            onClick={() => setFilters({ ...filters, reportType: 'attendance' })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filters.reportType === 'attendance' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Clock className="w-4 h-4" /> Attendance
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Academic Year</label>
                        <input
                            type="text"
                            placeholder="e.g. 2023-2024"
                            value={filters.academicYear}
                            onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
                            disabled={user?.role === 'staff'}
                            className={`w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all ${user?.role === 'staff' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Semester</label>
                        <select
                            value={filters.semester}
                            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="">Select Semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Section</label>
                        <select
                            value={filters.section}
                            onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="">Select Section</option>
                            {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Month</label>
                        <input
                            type="month"
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchReportData}
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : <><Search className="w-4 h-4" /> Generate Report</>}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {reportData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{reportData.header.title}</h1>
                                <p className="text-gray-500 text-sm">{reportData.header.subtitle} - {reportData.header.department} ({reportData.header.year})</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownload('excel')}
                                    className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
                                >
                                    <Download className="w-4 h-4" /> Excel
                                </button>
                                <button
                                    onClick={() => handleDownload('pdf')}
                                    className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all border border-rose-100"
                                >
                                    <Printer className="w-4 h-4" /> PDF
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Roll No</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky left-[100px] bg-gray-50 z-10">Student</th>

                                        {filters.reportType === 'internal' && reportData.subjects.map((sub: any) => (
                                            <th key={sub.code} colSpan={2} className="px-6 py-4 text-[10px] font-bold text-center text-gray-400 uppercase tracking-wider border-l border-gray-100 bg-gray-50/50">
                                                {sub.code}
                                            </th>
                                        ))}

                                        {filters.reportType === 'internal' && (
                                            <>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-100">Total</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-100">Average</th>
                                            </>
                                        )}

                                        {filters.reportType === 'attendance' && (
                                            <>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-100 text-center">Working Days</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-100 text-center">Present Days</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-100 text-center">Attendance %</th>
                                            </>
                                        )}

                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-100">Risk</th>
                                    </tr>
                                    {filters.reportType === 'internal' && (
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="sticky left-0 bg-gray-50 z-10"></th>
                                            <th className="sticky left-[100px] bg-gray-50 z-10"></th>
                                            {reportData.subjects.map((sub: any) => (
                                                <React.Fragment key={`${sub.code}-sub`}>
                                                    <th className="px-3 py-2 text-[8px] font-bold text-center text-gray-400 uppercase border-l border-gray-100">CIA1</th>
                                                    <th className="px-3 py-2 text-[8px] font-bold text-center text-gray-400 uppercase border-l border-gray-100">CIA2</th>
                                                </React.Fragment>
                                            ))}
                                            <th className="border-l border-gray-100"></th>
                                            <th className="border-l border-gray-100"></th>
                                            <th className="border-l border-gray-100"></th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {reportData.data.map((row: any, idx: number) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-mono text-gray-600 sticky left-0 bg-white z-10">{row.rollNo}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 sticky left-[100px] bg-white z-10">{row.studentName}</td>

                                            {filters.reportType === 'internal' && reportData.subjects.map((sub: any) => (
                                                <React.Fragment key={`${sub.code}-${idx}`}>
                                                    <td className="px-3 py-4 text-xs text-center border-l border-gray-50">{row.subjects[sub.code]?.cia1 || 0}</td>
                                                    <td className="px-3 py-4 text-xs text-center border-l border-gray-50">{row.subjects[sub.code]?.cia2 || 0}</td>
                                                </React.Fragment>
                                            ))}

                                            {filters.reportType === 'internal' && (
                                                <>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 border-l border-gray-50">{row.total}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-indigo-600 border-l border-gray-50">{row.average}</td>
                                                </>
                                            )}

                                            {filters.reportType === 'attendance' && (
                                                <>
                                                    <td className="px-6 py-4 text-sm text-center border-l border-gray-50">{row.totalWorkingDays}</td>
                                                    <td className="px-6 py-4 text-sm text-center border-l border-gray-50 font-bold text-indigo-600">{row.presentDays}</td>
                                                    <td className="px-6 py-4 text-sm text-center border-l border-gray-50 font-extrabold">{row.attendance}%</td>
                                                </>
                                            )}

                                            <td className="px-6 py-4 border-l border-gray-50">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${row.color === 'Green' ? 'bg-green-100 text-green-700' :
                                                    row.color === 'Yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {row.risk} RISK
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!reportData && (
                <div className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Report Generated</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                        Select Academic Year, semester, and section above, then choose report type to generate the report.
                    </p>
                </div>
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
