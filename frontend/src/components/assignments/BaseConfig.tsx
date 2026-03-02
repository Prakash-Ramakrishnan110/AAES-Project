import React from 'react';

interface BaseConfigProps {
    formData: any;
    setFormData: (data: any) => void;
    mySubjects: any[];
}

const BaseConfig: React.FC<BaseConfigProps> = ({ formData, setFormData, mySubjects }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Basic Details</h3>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Assignment Title</label>
                <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g., Midterm React Application"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description / Instructions</label>
                <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    placeholder="Provide clear instructions for the students..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Select Subject</label>
                    <select
                        required
                        value={formData.subjectId}
                        onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none pr-10 appearance-none bg-white"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        <option value="">-- Choose Subject --</option>
                        {mySubjects.map(sub => (
                            <option key={sub._id} value={sub._id}>
                                {sub.name} ({sub.code})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Submission Deadline</label>
                    <input
                        type="datetime-local"
                        required
                        value={formData.deadline}
                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Target Section</label>
                    <select
                        required
                        value={formData.section || 'All'}
                        onChange={e => setFormData({ ...formData, section: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none pr-10 appearance-none bg-white"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        <option value="All">All Sections (A, B, C, D)</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Total Marks</label>
                    <input
                        type="number"
                        min="1"
                        required
                        value={formData.maxMarks}
                        onChange={e => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Format / Submission Type</label>
                    <select
                        required
                        value={formData.submissionType}
                        onChange={e => setFormData({ ...formData, submissionType: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-700 bg-indigo-50 border-indigo-200"
                    >
                        <option value="Handwritten">Handwritten (CamScanner/Images)</option>
                        <option value="Document">Word / PDF Document</option>
                        <option value="PPT">Presentation (PPT)</option>
                        <option value="Quiz">Online Quiz (MCQ/TF)</option>
                        <option value="Programming">Programming (Code Editor)</option>
                        <option value="Seminar">Seminar / Presentation Activity</option>
                    </select>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mt-8">Submission Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div>
                        <p className="text-sm font-bold text-gray-800">Late Submission</p>
                        <p className="text-xs text-gray-500">Allow after deadline</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={formData.rules?.lateAllowed || false} onChange={e => setFormData({ ...formData, rules: { ...formData.rules, lateAllowed: e.target.checked } })} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div>
                        <p className="text-sm font-bold text-gray-800">Resubmission</p>
                        <p className="text-xs text-gray-500">Allow overwrite submission</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={formData.rules?.resubmissionAllowed || false} onChange={e => setFormData({ ...formData, rules: { ...formData.rules, resubmissionAllowed: e.target.checked } })} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-bold text-gray-800">Late Penalty (%)</label>
                    </div>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={!formData.rules?.lateAllowed}
                        value={formData.rules?.latePenalty || 0}
                        onChange={e => setFormData({ ...formData, rules: { ...formData.rules, latePenalty: parseInt(e.target.value) || 0 } })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-200 disabled:text-gray-400"
                    />
                </div>
            </div>
        </div>
    );
};

export default BaseConfig;
