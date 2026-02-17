import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const BulkUpload = () => {
    const { token } = useContext(AuthContext)!;
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file');
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
                'http://localhost:5000/api/users/bulk-upload',
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
        <div>
            <h1 className="text-2xl font-bold mb-6">Bulk User Upload</h1>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                <h3 className="font-bold text-blue-900 mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                    <li>Download the CSV template below</li>
                    <li>Fill in user details (username, email, password, role, department, etc.)</li>
                    <li>Valid roles: admin, hod, staff, student</li>
                    <li>Upload the completed CSV file</li>
                </ol>
                <button
                    onClick={downloadTemplate}
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                    Download Template
                </button>
            </div>

            {/* Upload Form */}
            <div className="bg-white rounded shadow p-6 mb-6">
                <form onSubmit={handleUpload}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Select CSV File
                        </label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Upload Users'}
                    </button>
                </form>
            </div>

            {/* Results */}
            {result && (
                <div className={`rounded shadow p-6 ${result.error ? 'bg-red-50' : 'bg-green-50'}`}>
                    <h3 className="font-bold text-lg mb-4">
                        {result.error ? 'Upload Failed' : 'Upload Complete'}
                    </h3>

                    {result.error ? (
                        <p className="text-red-700">{result.error}</p>
                    ) : (
                        <>
                            <div className="mb-4">
                                <p className="text-green-700">
                                    <strong>Success:</strong> {result.successCount} users created
                                </p>
                                <p className="text-red-700">
                                    <strong>Failed:</strong> {result.failedCount} users
                                </p>
                            </div>

                            {result.failed && result.failed.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-bold mb-2">Failed Entries:</h4>
                                    <div className="max-h-60 overflow-y-auto">
                                        {result.failed.map((fail: any, idx: number) => (
                                            <div key={idx} className="bg-white p-2 mb-2 rounded border border-red-200">
                                                <p className="text-sm"><strong>User:</strong> {fail.user}</p>
                                                <p className="text-sm text-red-600"><strong>Error:</strong> {fail.error}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.errors && result.errors.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-bold mb-2">Validation Errors:</h4>
                                    <div className="max-h-60 overflow-y-auto">
                                        {result.errors.map((err: any, idx: number) => (
                                            <div key={idx} className="bg-white p-2 mb-2 rounded border border-red-200">
                                                <p className="text-sm"><strong>Line:</strong> {err.line}</p>
                                                <p className="text-sm text-red-600"><strong>Error:</strong> {err.error}</p>
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
