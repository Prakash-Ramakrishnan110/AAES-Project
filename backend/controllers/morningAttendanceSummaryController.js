const MorningAttendanceSummary = require('../models/MorningAttendanceSummary');

// @desc    Record morning attendance summary
// @route   POST /api/morning-attendance
// @access  Private (Lab Assistant)
exports.recordSummary = async (req, res) => {
    try {
        const {
            department,
            year,
            semester,
            section,
            date,
            totalStudents,
            presentCount,
            absentCount,
            odCount
        } = req.body;

        // Validation: presentCount + absentCount + odCount = totalStudents
        if (Number(presentCount) + Number(absentCount) + Number(odCount) !== Number(totalStudents)) {
            return res.status(400).json({
                message: "Attendance count does not match the total number of students."
            });
        }

        const summaryDate = new Date(date);
        summaryDate.setHours(0, 0, 0, 0);

        const summary = await MorningAttendanceSummary.findOneAndUpdate(
            { department, year, section, date: summaryDate },
            {
                department,
                year,
                semester,
                section,
                date: summaryDate,
                totalStudents,
                presentCount,
                absentCount,
                odCount,
                enteredBy: req.user.id
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.status(201).json({
            message: 'Morning attendance summary recorded successfully',
            summary
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Summary already exists for this class and date.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get morning attendance history for entered user
// @route   GET /api/morning-attendance/history
// @access  Private (Lab Assistant)
exports.getHistory = async (req, res) => {
    try {
        const history = await MorningAttendanceSummary.find({ enteredBy: req.user.id })
            .sort({ date: -1 })
            .limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get morning attendance reports for HOD
// @route   GET /api/morning-attendance/report
// @access  Private (HOD/Admin/Principal)
exports.getReport = async (req, res) => {
    try {
        const { department, year, date } = req.query;
        let query = {};

        // HODs can only see their department
        if (req.user.role === 'hod') {
            query.department = req.user.department;
        } else if (department) {
            query.department = department;
        }

        if (year) query.year = year;
        if (date) {
            const queryDate = new Date(date);
            queryDate.setHours(0, 0, 0, 0);
            query.date = queryDate;
        }

        const reports = await MorningAttendanceSummary.find(query)
            .populate('enteredBy', 'username fullName')
            .sort({ date: -1 });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
