import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const StudentAssignmentView = () => {
    const { id } = useParams();
    const { token } = useContext(AuthContext)!;

    const [assignment, setAssignment] = useState<any>(null);
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [answerText, setAnswerText] = useState('');
    const [code, setCode] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Get Assignment Details
            const assRes = await axios.get(`http://localhost:5000/api/assignments/${id}`, config);
            setAssignment(assRes.data);

            // Get Existing Submission (if any)
            // We need an endpoint for this, or filters on getMySubmissions.
            // For MVP, fetch all my submissions and find this one. (Not efficient but works for now)
            const subRes = await axios.get(`http://localhost:5000/api/submissions/my`, config);
            const mySub = subRes.data.find((s: any) => s.assignment._id === id);

            if (mySub) {
                setSubmission(mySub);
                setAnswerText(mySub.answers || '');
                setCode(mySub.code || '');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const formData = new FormData();
            formData.append('assignmentId', id || '');
            formData.append('answers', answerText);
            formData.append('code', code);
            if (file) {
                formData.append('file', file);
            }

            await axios.post('http://localhost:5000/api/submissions', formData, config);
            alert('Assignment Submitted!');
            fetchData(); // Refresh to show status
        } catch (error) {
            console.error(error);
            alert('Error submitting');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!assignment) return <div>Assignment not found</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
            {/* Header */}
            <div className="mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
                <div className="flex justify-between text-gray-600">
                    <span>{assignment.subject.name} ({assignment.subject.code})</span>
                    <span>Max Marks: {assignment.maxMarks}</span>
                </div>
                <div className="mt-2 text-sm text-red-600">
                    Deadline: {new Date(assignment.deadline).toLocaleString()}
                </div>
            </div>

            {/* Description */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <div className="bg-gray-50 p-4 rounded text-gray-800 whitespace-pre-wrap">
                    {assignment.description}
                </div>
            </div>

            {/* Submission Form */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Your Submission</h2>

                {submission && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                        <p className="font-bold text-blue-700">Status: {submission.status.toUpperCase()}</p>
                        {submission.marks > 0 && <p>Marks: {submission.marks}/{assignment.maxMarks}</p>}
                        {submission.aiAnalysis && (
                            <div className="mt-2">
                                <p className="font-semibold">AI Feedback:</p>
                                <p>{submission.aiAnalysis.rawOutput}</p>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {assignment.type === 'theory' ? (
                        <div className="mb-4">
                            <label className="block font-medium mb-1">Upload Answer (Image)</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full p-2 border rounded"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <p className="text-sm text-gray-500 mt-1">Upload an image of your handwritten answer for AI grading.</p>

                            <label className="block font-medium mb-1 mt-4">Or Type Answer</label>
                            <textarea
                                className="w-full p-2 border rounded h-32"
                                value={answerText}
                                onChange={e => setAnswerText(e.target.value)}
                                placeholder="Type your answer here..."
                            />
                        </div>
                    ) : (
                        <div className="mb-4">
                            <label className="block font-medium mb-1">Python Code</label>
                            <textarea
                                className="w-full p-2 border rounded h-64 font-mono bg-gray-900 text-green-400"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                placeholder="def solution(): ..."
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 font-bold"
                    >
                        {submission ? 'Re-Submit' : 'Submit Assignment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentAssignmentView;
