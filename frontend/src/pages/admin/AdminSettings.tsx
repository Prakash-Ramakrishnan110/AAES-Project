import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Settings, Save, Download, Upload, Server, Database, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminSettings = () => {
    const { token } = useContext(AuthContext)!;
    const [academicYear, setAcademicYear] = useState('2024-2025');
    const [semester, setSemester] = useState('Odd');
    const [aiUrl, setAiUrl] = useState('http://localhost:8000');

    const [saving, setSaving] = useState(false);
    const [backupLoading, setBackupLoading] = useState(false);
    const [restoreLoading, setRestoreLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchSettings();
    }, [token]);

    const fetchSettings = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/settings`, config);
            if (data) {
                setAcademicYear(data.currentAcademicYear || '2024-2025');
                setSemester(data.currentSemester || 'Odd');
                setAiUrl(data.aiEngineUrl || 'http://localhost:8000');
            }
        } catch (err: any) {
            console.error("Failed to fetch global settings:", err);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API}/api/settings`, {
                currentAcademicYear: academicYear,
                currentSemester: semester,
                aiEngineUrl: aiUrl
            }, config);

            showToast('Global settings updated successfully', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleBackup = async () => {
        setBackupLoading(true);
        try {
            const config: any = {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            };
            const response = await axios.get(`${API}/api/settings/backup`, config);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `system_backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showToast('Backup successful', 'success');
        } catch (error: any) {
            showToast('Failed to download database backup', 'error');
        } finally {
            setBackupLoading(false);
        }
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleRestoreUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('WARNING: Restoring a backup will securely WIPE the current database and replace it with the uploaded file. Do you want to proceed?')) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setRestoreLoading(true);
        try {
            const formData = new FormData();
            formData.append('backupFile', file);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            await axios.post(`${API}/api/settings/restore`, formData, config);
            showToast('Database restore complete', 'success');
            setTimeout(() => window.location.reload(), 2000); // Reload to flush state
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Restore failed', 'error');
        } finally {
            setRestoreLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const showToast = (text: string, type: 'success' | 'error') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {toastMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg font-medium border text-sm flex items-center gap-2
                        ${toastMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                    {toastMessage.text}
                </motion.div>
            )}

            <div>
                <h1 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-3">
                    <Settings className="w-7 h-7 text-slate-900" />
                    System Settings
                </h1>
                <p className="text-slate-500 mt-1">Manage global platform configurations and data ops.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Academic Configuration */}
                <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Server className="w-5 h-5 text-slate-700" />
                        Global Configurations
                    </h2>

                    <form onSubmit={handleSaveSettings} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-0.5">Active Academic Year</label>
                            <input
                                type="text"
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                                placeholder="e.g. 2024-2025"
                                required
                                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 block px-3 py-2.5 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-0.5">Current Semester</label>
                            <select
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 block px-3 py-2.5 transition-colors"
                            >
                                <option value="Odd">Odd Semester</option>
                                <option value="Even">Even Semester</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-0.5">AI Engine Endpoint</label>
                            <input
                                type="url"
                                value={aiUrl}
                                onChange={(e) => setAiUrl(e.target.value)}
                                placeholder="http://localhost:8000"
                                required
                                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 block px-3 py-2.5 transition-colors"
                            />
                            <p className="text-xs text-slate-500 mt-1.5 ml-0.5">URL of the Python Ollama OCR/Grading microservice.</p>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex justify-center items-center gap-2 w-full bg-slate-900 text-white rounded-md px-4 py-2.5 hover:bg-slate-800 transition-colors font-medium text-sm shadow-sm disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Configurations</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Database Operations */}
                <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Database className="w-5 h-5 text-slate-700" />
                        Data Operations
                    </h2>
                    <p className="text-sm text-slate-600 mb-6">
                        Backup your complete MongoDB system state to a secure JSON file, or restore the platform entirely from an existing backup snapshot.
                    </p>

                    <div className="space-y-4 mt-auto">
                        <div className="p-5 rounded-md border border-sky-200 bg-sky-50">
                            <h3 className="font-bold text-sky-900 text-sm mb-1">Database Backup</h3>
                            <p className="text-xs text-sky-800 mb-4">Download a complete snapshot of all collections.</p>
                            <button
                                onClick={handleBackup}
                                disabled={backupLoading}
                                className="flex justify-center items-center gap-2 w-full bg-white border border-sky-300 text-sky-800 rounded-md px-4 py-2.5 hover:bg-sky-100 transition-colors font-semibold text-sm shadow-sm disabled:opacity-70"
                            >
                                {backupLoading ? 'Building Backup...' : <><Download className="w-4 h-4" /> Export Backup (.json)</>}
                            </button>
                        </div>

                        <div className="p-5 rounded-md border border-red-200 bg-red-50">
                            <h3 className="font-bold text-red-900 text-sm mb-1 flex justify-between items-center">
                                Database Restore
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                            </h3>
                            <p className="text-xs text-red-800 mb-4">Target backup file will permanently overwrite current data.</p>

                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleRestoreUpload}
                            />

                            <button
                                onClick={handleRestoreClick}
                                disabled={restoreLoading}
                                className="flex justify-center items-center gap-2 w-full bg-red-600 text-white rounded-md px-4 py-2.5 hover:bg-red-700 transition-colors font-semibold text-sm shadow-sm disabled:opacity-70"
                            >
                                {restoreLoading ? 'Restoring Systems...' : <><Upload className="w-4 h-4" /> Upload Restore Image</>}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminSettings;
