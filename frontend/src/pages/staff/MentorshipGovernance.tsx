import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, AlertOctagon, Calendar, User, Search, ChevronRight, MessageSquare, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface RiskData {
    attendancePercentage: number;
    internalPercentage: number;
    assignmentPercentage: number;
    riskLevel: 'Green' | 'Yellow' | 'Red' | 'Unknown';
}


interface Mentee extends RiskData {
    studentId: string;
    name: string;
    registerNumber: string;
    lastInteractionDate: string | null;
}

interface Interaction {
    _id: string;
    interactionType: string;
    summary: string;
    actionPlan: string;
    followUpDate?: string;
    createdAt: string;
    riskLevelAtTimeOfInteraction: string;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MentorshipGovernance = () => {
    const { token } = useContext(AuthContext)!;
    const [summary, setSummary] = useState({ totalMentees: 0, warningCount: 0, criticalCount: 0, upcomingFollowUps: 0 });
    const [mentees, setMentees] = useState<Mentee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [selectedStudent, setSelectedStudent] = useState<Mentee | null>(null);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [isInteractionsLoading, setIsInteractionsLoading] = useState(false);

    // New Interaction form state
    const [isAddingInteraction, setIsAddingInteraction] = useState(false);
    const [newInteraction, setNewInteraction] = useState({
        interactionType: 'Academic',
        summary: '',
        actionPlan: '',
        followUpDate: ''
    });

    useEffect(() => {
        fetchDashboardData();
    }, [token]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/governance/mentor/dashboard`, config);
            setSummary(data.summary);
            setMentees(data.mentees);
        } catch (error) {
            console.error('Error fetching mentor dashboard', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInteractions = async (studentId: string) => {
        setIsInteractionsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/governance/mentor/interaction/${studentId}`, config);
            setInteractions(data);
        } catch (error) {
            console.error('Error fetching interactions', error);
        } finally {
            setIsInteractionsLoading(false);
        }
    };

    const handleStudentClick = (student: Mentee) => {
        setSelectedStudent(student);
        fetchInteractions(student.studentId);
    };

    const submitInteraction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API}/api/governance/mentor/interaction`, {
                studentId: selectedStudent.studentId,
                ...newInteraction
            }, config);

            // Reset and refetch
            setNewInteraction({ interactionType: 'Academic', summary: '', actionPlan: '', followUpDate: '' });
            setIsAddingInteraction(false);
            fetchInteractions(selectedStudent.studentId);
            fetchDashboardData(); // Refetch dashboard to update last interaction & risk tier if applicable
        } catch (error) {
            console.error('Error submitting interaction', error);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Green': return 'bg-green-100 text-green-700 border-green-200';
            case 'Yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Red': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredMentees = mentees.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.registerNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-medium">Loading Governance Data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-b-2 border-indigo-600 inline-block pb-1">Mentorship Governance</h1>
                    <p className="text-gray-500 text-sm mt-2">Manage your assigned mentees and academic tracking interactions.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Mentees</p>
                        <h3 className="text-2xl font-bold text-gray-900">{summary.totalMentees}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Warning Cases</p>
                        <h3 className="text-2xl font-bold text-gray-900">{summary.warningCount}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertOctagon className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Critical Cases</p>
                        <h3 className="text-2xl font-bold text-gray-900">{summary.criticalCount}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Calendar className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Upcoming Follow-ups</p>
                        <h3 className="text-2xl font-bold text-gray-900">{summary.upcomingFollowUps}</h3>
                    </div>
                </div>
            </div>

            {/* Mentee List */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Your Mentees</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-sm">
                                <th className="p-4 font-semibold text-gray-600">Student Name</th>
                                <th className="p-4 font-semibold text-gray-600">Attendance</th>
                                <th className="p-4 font-semibold text-gray-600">Internals</th>
                                <th className="p-4 font-semibold text-gray-600">Assignments</th>
                                <th className="p-4 font-semibold text-gray-600">Risk Level</th>
                                <th className="p-4 font-semibold text-gray-600">Last Interaction</th>
                                <th className="p-4 font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMentees.map(mentee => (
                                <motion.tr
                                    whileHover={{ backgroundColor: '#f9fafb' }}
                                    key={mentee.studentId}
                                    className="group transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                {mentee.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{mentee.name}</p>
                                                <p className="text-xs text-gray-500">{mentee.registerNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-sm font-medium ${mentee.attendancePercentage < 75 ? 'text-red-600' : 'text-gray-700'}`}>
                                                {mentee.attendancePercentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-sm font-medium ${mentee.internalPercentage < 50 ? 'text-red-600' : 'text-gray-700'}`}>
                                            {mentee.internalPercentage.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-sm font-medium ${mentee.assignmentPercentage < 60 ? 'text-red-600' : 'text-gray-700'}`}>
                                            {mentee.assignmentPercentage.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskColor(mentee.riskLevel)}`}>
                                            {mentee.riskLevel}
                                        </span>
                                    </td>


                                    <td className="p-4 text-sm text-gray-500">
                                        {mentee.lastInteractionDate ? new Date(mentee.lastInteractionDate).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleStudentClick(mentee)}
                                            className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors flex items-center text-sm font-medium"
                                        >
                                            Details <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredMentees.length === 0 && (
                                <tr><td colSpan={6} className="p-6 text-center text-gray-500">No mentees found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Interaction Slide-over / Modal */}
            <AnimatePresence>
                {selectedStudent && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                            onClick={() => { setSelectedStudent(null); setIsAddingInteraction(false); }}
                        />
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h2>
                                    <p className="text-sm text-gray-500">{selectedStudent.registerNumber}</p>
                                    <div className="mt-2 flex space-x-2">
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getRiskColor(selectedStudent.riskLevel)}`}>
                                            Risk: {selectedStudent.riskLevel}
                                        </span>
                                        <span className="px-2 py-0.5 text-xs font-medium rounded border border-gray-200 bg-white text-gray-600">
                                            Att: {selectedStudent.attendancePercentage.toFixed(0)}% | Int: {selectedStudent.internalPercentage.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => { setSelectedStudent(null); setIsAddingInteraction(false); }} className="p-2 bg-white hover:bg-gray-100 rounded-full border border-gray-200 transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                                {!isAddingInteraction ? (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-800 flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> Interaction History</h3>
                                            <Button onClick={() => setIsAddingInteraction(true)} className="py-1.5 px-3 text-sm flex items-center">
                                                <Plus className="w-4 h-4 mr-1" /> Log New
                                            </Button>
                                        </div>

                                        {isInteractionsLoading ? (
                                            <p className="text-center text-sm text-gray-500 py-4">Loading history...</p>
                                        ) : interactions.length > 0 ? (
                                            <div className="space-y-4">
                                                {interactions.map(interaction => (
                                                    <div key={interaction._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                                                        <div className={`absolute top-0 left-0 w-1 h-full ${interaction.riskLevelAtTimeOfInteraction === 'Red' ? 'bg-red-500' :
                                                            interaction.riskLevelAtTimeOfInteraction === 'Yellow' ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}></div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200">
                                                                {interaction.interactionType}
                                                            </span>
                                                            <span className="text-xs text-gray-400 font-medium">{new Date(interaction.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-800 font-medium mb-1">{interaction.summary}</p>
                                                        <p className="text-xs text-gray-600 mb-2 p-2 bg-gray-50 border border-gray-100 rounded">💡 Action: {interaction.actionPlan}</p>

                                                        {interaction.followUpDate && (
                                                            <div className="flex items-center text-xs text-indigo-600 font-medium mt-2">
                                                                <Calendar className="w-3 h-3 mr-1" /> Follow-up due: {new Date(interaction.followUpDate).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 bg-white border border-gray-200 rounded-xl border-dashed">
                                                <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-gray-500 text-sm">No recorded interactions yet.</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <form onSubmit={submitInteraction} className="space-y-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-gray-800">New Interaction</h3>
                                            <button type="button" onClick={() => setIsAddingInteraction(false)} className="text-sm text-gray-500 hover:text-gray-800">Cancel</button>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Type</label>
                                            <select
                                                value={newInteraction.interactionType}
                                                onChange={e => setNewInteraction({ ...newInteraction, interactionType: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="Academic">Academic / Grades</option>
                                                <option value="Attendance">Attendance Issues</option>
                                                <option value="Personal">Personal / Counseling</option>
                                                <option value="General">General Check-in</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Summary of Discussion</label>
                                            <textarea
                                                required
                                                rows={3}
                                                value={newInteraction.summary}
                                                onChange={e => setNewInteraction({ ...newInteraction, summary: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="What was discussed?"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Action Plan</label>
                                            <textarea
                                                required
                                                rows={2}
                                                value={newInteraction.actionPlan}
                                                onChange={e => setNewInteraction({ ...newInteraction, actionPlan: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Agreed next steps..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Follow-up Date (Optional)</label>
                                            <input
                                                type="date"
                                                value={newInteraction.followUpDate}
                                                onChange={e => setNewInteraction({ ...newInteraction, followUpDate: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl mt-4">
                                            <p className="text-xs text-red-600 font-medium">
                                                Note: If the student is in Critical (Red) state, logging consecutive issues will automatically trigger an escalation to the HOD.
                                            </p>
                                        </div>

                                        <Button type="submit" className="w-full py-2.5">Save Interaction</Button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MentorshipGovernance;
