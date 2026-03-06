import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FileText, Download, AlertCircle, Search, Filter, Printer, BookOpen, Clock, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import React from 'react';

const HODConsolidatedReports = () => {
    const { token, user } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [filters, setFilters] = useState({
        department: user?.department || '',
        academicYear: '1st Year',
        semester: '',
        section: 'A',
        month: '',
        reportType: 'internal' // 'internal' or 'attendance'
    });

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const SECTIONS = ['A', 'B', 'C', 'D'];
    const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

    const fetchReportData = async () => {
        if (!filters.semester || !filters.section || !filters.academicYear) {
            alert('Please select Year, Semester and Section');
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
            link.setAttribute('download', `${filters.reportType}_Report_${filters.academicYear}_${filters.section}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            alert(`Failed to download ${type.toUpperCase()} report.`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Consolidated Reports</h1>
                        <p className="text-sm text-gray-500">Generate class-wide internal marks and attendance sheets</p>
                    </div>
                </div>
            </div>

            {/* Filter Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Filter className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Report Customization</h2>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-2xl self-start">
                        <button
                            onClick={() => setFilters({ ...filters, reportType: 'internal' })}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filters.reportType === 'internal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <BookOpen className="w-4 h-4" /> Internal Marks
                        </button>
                        <button
                            onClick={() => setFilters({ ...filters, reportType: 'attendance' })}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filters.reportType === 'attendance' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Clock className="w-4 h-4" /> Attendance
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Academic Year</label>
                        <select
                            value={filters.academicYear}
                            onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                        >
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Semester</label>
                        <select
                            value={filters.semester}
                            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="">Select Semester</option>
                            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Section</label>
                        <select
                            value={filters.section}
                            onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                        >
                            {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Target Month (Optional)</label>
                        <input
                            type="month"
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchReportData}
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><Search className="w-4 h-4" /> Generate Report</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {reportData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{reportData.header.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase border border-indigo-100">
                                        {reportData.header.department}
                                    </span>
                                    <span className="text-gray-400 text-sm">•</span>
                                    <p className="text-gray-500 text-sm font-medium">{reportData.header.subtitle}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDownload('excel')}
                                    className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all border border-emerald-200"
                                >
                                    <Download className="w-4 h-4" /> Export Excel
                                </button>
                                <button
                                    onClick={() => handleDownload('pdf')}
                                    className="flex items-center gap-2 bg-rose-50 text-rose-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all border border-rose-200"
                                >
                                    <Printer className="w-4 h-4" /> Export PDF
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-24">Roll No</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky left-[96px] bg-gray-50 z-10">Student Name</th>

                                        {filters.reportType === 'internal' && reportData.subjects.map((sub: any) => (
                                            <th key={sub.code} colSpan={2} className="px-4 py-4 text-[10px] font-bold text-center text-gray-400 uppercase border-l border-gray-100 bg-gray-50/50">
                                                {sub.code}
                                            </th>
                                        ))}

                                        {filters.reportType === 'internal' && (
                                            <>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-100 text-center">Total</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-100 text-center">Average</th>
                                            </>
                                        )}

                                        {filters.reportType === 'attendance' && (
                                            <>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-100 text-center">Working</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-100 text-center">Present</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-100 text-center font-bold text-indigo-600">%</th>
                                            </>
                                        )}

                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-100 text-center">Risk Status</th>
                                    </tr>
                                    {filters.reportType === 'internal' && (
                                        <tr className="bg-gray-50/30 border-b border-gray-100">
                                            <th className="sticky left-0 bg-gray-50 z-10"></th>
                                            <th className="sticky left-[96px] bg-gray-50 z-10"></th>
                                            {reportData.subjects.map((sub: any) => (
                                                <React.Fragment key={`${sub.code}-sub`}>
                                                    <th className="px-2 py-2 text-[8px] font-bold text-center text-gray-400 uppercase border-l border-gray-100">CIA1</th>
                                                    <th className="px-2 py-2 text-[8px] font-bold text-center text-gray-400 uppercase border-l border-gray-100">CIA2</th>
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
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-6 py-4 text-xs font-mono text-gray-500 sticky left-0 bg-white group-hover:bg-indigo-50/30 z-10">{row.rollNo}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 sticky left-[96px] bg-white group-hover:bg-indigo-50/30 z-10">{row.studentName}</td>

                                            {filters.reportType === 'internal' && reportData.subjects.map((sub: any) => (
                                                <React.Fragment key={`${sub.code}-${idx}`}>
                                                    <td className="px-3 py-4 text-xs text-center border-l border-gray-50 font-medium">{row.subjects[sub.code]?.cia1 || '—'}</td>
                                                    <td className="px-3 py-4 text-xs text-center border-l border-gray-50 font-medium">{row.subjects[sub.code]?.cia2 || '—'}</td>
                                                </React.Fragment>
                                            ))}

                                            {filters.reportType === 'internal' && (
                                                <>
                                                    <td className="px-6 py-4 text-sm font-black text-gray-900 border-l border-gray-50 text-center">{row.total}</td>
                                                    <td className="px-6 py-4 text-sm font-black text-indigo-600 border-l border-gray-50 text-center">{row.average}</td>
                                                </>
                                            )}

                                            {filters.reportType === 'attendance' && (
                                                <>
                                                    <td className="px-6 py-4 text-sm text-center border-l border-gray-50 font-medium">{row.totalWorkingDays}</td>
                                                    <td className="px-6 py-4 text-sm text-center border-l border-gray-50 font-bold text-indigo-600">{row.presentDays}</td>
                                                    <td className="px-6 py-4 text-sm text-center border-l border-gray-50 font-black">{row.attendance}%</td>
                                                </>
                                            )}

                                            <td className="px-6 py-4 border-l border-gray-50 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${row.color === 'Green' ? 'bg-green-100 text-green-700' :
                                                        row.color === 'Yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {row.risk}
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
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 py-24 flex flex-col items-center text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                        <FileText className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Configure Your Report</h3>
                    <p className="text-sm text-gray-500 max-w-sm px-6">
                        Use the filters above to define the class and report type you need. Click "Generate Report" to view results here.
                    </p>
                </div>
            )}

            <div className="bg-indigo-900 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl shadow-indigo-200">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertCircle className="w-7 h-7 text-indigo-200" />
                </div>
                <div className="space-y-1 text-center md:text-left">
                    <p className="text-lg font-bold text-white">Confidential Reporting Module</p>
                    <p className="text-indigo-200 text-sm leading-relaxed max-w-2xl">
                        This dashboard provides aggregated sensitive data for administrative oversight.
                        Unauthorized distribution or modification of these reports is strictly prohibited
                        under the Institutional Data Protection Agreement.
                    </p>
                </div>
                <div className="md:ml-auto">
                    <button className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors whitespace-nowrap">
                        Data Policy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HODConsolidatedReports;
