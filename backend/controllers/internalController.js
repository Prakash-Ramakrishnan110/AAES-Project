const InternalMark = require('../models/InternalMark');
const Subject = require('../models/Subject');

// @desc    Get internal marks for current student
// @route   GET /api/internal/student-marks
// @access  Private/Student
const getStudentMarks = async (req, res) => {
    try {
        const marks = await InternalMark.find({ student: req.user.id })
            .populate('subject', 'name code department semester')
            .sort({ createdAt: -1 });
            
        // Map to include fields expected by the frontend
        const formattedMarks = marks.map(m => {
            const totalMax = m.componentMarks.reduce((sum, c) => sum + (c.maxMarks || 0), 0);
            const totalObtained = m.componentMarks.reduce((sum, c) => sum + (c.marksObtained || 0), 0);
            
            return {
                ...m.toObject(),
                totalMax,
                totalObtained
            };
        });
            
        res.json(formattedMarks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudentMarks
};
