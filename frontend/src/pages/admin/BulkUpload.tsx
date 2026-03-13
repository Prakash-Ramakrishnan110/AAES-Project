import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BulkUpload = () => {
    const { token } = useContext(AuthContext)!;
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setToastMessage({ text: 'Please select a file', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }

        setUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const { data } = await axios.post(
                `${API}/api/users/bulk-upload`,
                formData,
                config
            );

            setResult(data);
            setFile(null);
        } catch (error: any) {
            setResult({
                message: 'Upload failed',
                error: error.response?.data?.message || error.message
            });
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = 'username,email,password,role,department,academicYear,semester\njohn_doe,john@example.com,pass123,student,Computer Science,2024-25,3';
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="relative">
            {/* Custom Toast Notification */}
            {toastMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg font-medium border text-sm flex items-center gap-2
                        ${toastMessage.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                    {toastMessage.text}
                </motion.div>
            )}

            <h1 className="text-2xl font-bold mb-6 text-slate-900">Bulk User Upload</h1>

            {/* Instructions */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-5 mb-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1.5 ml-1">
                    <li>Download the CSV template below</li>
                    <li>Fill in user details (username, email, password, role, department, etc.)</li>
                    <li>Valid roles: admin, hod, staff, student</li>
                    <li>Upload the completed CSV file</li>
                </ol>
                <button
                    onClick={downloadTemplate}
                    className="mt-4 bg-slate-900 text-white px-5 py-2.5 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm"
                >
                    Download Template
                </button>
            </div>

            {/* Upload Form */}
            <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 mb-6">
                <form onSubmit={handleUpload}>
                    <div className="mb-5">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Select CSV File
                        </label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-700 border border-slate-300 rounded-md cursor-pointer bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all font-medium h-[38px]"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-md hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm w-full sm:w-auto"
                    >
                        {uploading ? 'Uploading...' : 'Upload Users'}
                    </button>
                </form>
            </div>

            {/* Results */}
            {result && (
                <div className={`rounded-md shadow-sm border p-6 ${result.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <h3 className="font-bold text-lg mb-4 text-slate-800">
                        {result.error ? 'Upload Failed' : 'Upload Complete'}
                    </h3>

                    {result.error ? (
                        <p className="text-red-700 text-sm">{result.error}</p>
                    ) : (
                        <>
                            <div className="mb-4 text-sm">
                                <p className="text-green-700">
                                    <strong>Success:</strong> {result.successCount} users created
                                </p>
                                <p className="text-red-700">
                                    <strong>Failed:</strong> {result.failedCount} users
                                </p>
                            </div>

                            {result.failed && result.failed.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-sm text-slate-800 mb-2">Failed Entries:</h4>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {result.failed.map((fail: any, idx: number) => (
                                            <div key={idx} className="bg-white p-3 rounded-md border border-red-200 shadow-sm text-sm">
                                                <p><strong className="text-slate-700">User:</strong> {fail.user}</p>
                                                <p className="text-red-600 mt-1"><strong className="text-slate-700">Error:</strong> {fail.error}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.errors && result.errors.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-sm text-slate-800 mb-2">Validation Errors:</h4>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {result.errors.map((err: any, idx: number) => (
                                            <div key={idx} className="bg-white p-3 rounded-md border border-red-200 shadow-sm text-sm">
                                                <p><strong className="text-slate-700">Line:</strong> {err.line}</p>
                                                <p className="text-red-600 mt-1"><strong className="text-slate-700">Error:</strong> {err.error}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkUpload;
