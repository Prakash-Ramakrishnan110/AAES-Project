const ClassTimetable = require('../models/ClassTimetable');
const ClassActivityLog = require('../models/ClassActivityLog');
const ClassAdvisor = require('../models/ClassAdvisor');

// @desc    Create timetable entry
// @route   POST /api/timetable
// @access  Private/HOD
exports.createTimetableEntry = async (req, res) => {
    try {
        const { semester, subjectId, staffId, day, period, startTime, endTime } = req.body;

        const entry = new ClassTimetable({
            department: req.user.department,
            semester,
            subjectId,
            staffId,
            day,
            period,
            startTime,
            endTime
        });

        await entry.save();

        const populated = await ClassTimetable.findById(entry._id)
            .populate('subjectId', 'name code')
            .populate('staffId', 'name');

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Staff member is already assigned a class during this period.' });
        }
        console.error('Create timetable error:', error);
        res.status(500).json({ success: false, message: 'Server error creating timetable.' });
    }
};

// @desc    Delete timetable entry
// @route   DELETE /api/timetable/:id
// @access  Private/HOD
exports.deleteTimetableEntry = async (req, res) => {
    try {
        const entry = await ClassTimetable.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
        }

        // Only HODs from the same department should be able to delete
        if (entry.department.toLowerCase() !== req.user.department.toLowerCase() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this timetable entry.' });
        }

        await ClassTimetable.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Timetable entry removed successfully.' });
    } catch (error) {
        console.error('Delete timetable error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting timetable entry.' });
    }
};

// @desc    Get Department Timetable
// @route   GET /api/timetable/department/:semester
// @access  Private (HOD, Admin, or Class Advisor only)
exports.getDepartmentTimetable = async (req, res) => {
    try {
        const semester = parseInt(req.params.semester);
        const userId = req.user._id || req.user.id;

        // Restriction: If staff, must be a class advisor and restricted to their assigned year
        if (req.user.role === 'staff') {
            const assignment = await ClassAdvisor.findOne({ staff: userId });
            if (!assignment) {
                return res.status(403).json({ success: false, message: 'Access Denied: Only Class Advisors can view the department timetable.' });
            }

            // Map advisor academic year to allowed semesters (e.g., '1st Year' -> Sem 1 & 2)
            const yearNum = parseInt(assignment.academicYear);
            const allowedSemesters = [yearNum * 2 - 1, yearNum * 2];

            if (!allowedSemesters.includes(semester)) {
                return res.status(403).json({
                    success: false,
                    message: `Access Denied: You are authorized for ${assignment.academicYear} (Sems ${allowedSemesters.join(' & ')}) only.`
                });
            }
        }

        const timetable = await ClassTimetable.find({
            department: req.user.department,
            semester
        })
            .populate('subjectId', 'name code')
            .populate('staffId', 'fullName username department')
            .sort({ day: 1, period: 1 });

        res.status(200).json({ success: true, data: timetable });
    } catch (error) {
        console.error('Get timetable error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching timetable.' });
    }
};

// @desc    Get Staff personalized timetable
// @route   GET /api/timetable/staff/me
// @access  Private/Staff
exports.getMyTimetable = async (req, res) => {
    try {
        const timetable = await ClassTimetable.find({ staffId: req.user._id })
            .populate('subjectId', 'name code')
            .sort({ day: 1, period: 1 });

        res.status(200).json({ success: true, data: timetable });
    } catch (error) {
        console.error('Get staff timetable error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching your timetable.' });
    }
};

// @desc    Log class activity
// @route   POST /api/timetable/activity-log
// @access  Private/Staff
exports.createActivityLog = async (req, res) => {
    try {
        const { subjectId, date, time, period, topicCovered, remarks } = req.body;

        const Subject = require('../models/Subject');
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found.' });
        }

        const log = new ClassActivityLog({
            staffId: req.user._id,
            department: subject.department, // Use subject's department for visibility
            subjectId,
            date,
            time,
            period,
            topicCovered,
            remarks
        });

        await log.save();

        res.status(201).json({ success: true, data: log });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Activity log already exists for this period today.' });
        }
        console.error('Create activity log error:', error);
        res.status(500).json({ success: false, message: 'Server error creating activity log.' });
    }
};

// @desc    Get pending log reminders
// @route   GET /api/timetable/activity-log/reminders
// @access  Private/Staff
exports.getLogReminders = async (req, res) => {
    try {
        // Find what classes the staff has today based on day string
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDayStr = days[new Date().getDay()];

        // If sunday, probably no timetable
        if (todayDayStr === 'Sunday') {
            return res.status(200).json({ success: true, data: [] });
        }

        const todaysClasses = await ClassTimetable.find({
            staffId: req.user._id,
            day: todayDayStr
        }).populate('subjectId', 'name code');

        // Check which ones have logs recorded today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const logsToday = await ClassActivityLog.find({
            staffId: req.user._id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        const loggedPeriods = logsToday.map(l => l.period);

        // Reminders are today's classes that do NOT have a log
        const missingLogs = todaysClasses.filter(c => !loggedPeriods.includes(c.period));

        res.status(200).json({ success: true, data: missingLogs });
    } catch (error) {
        console.error('Get log reminders error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching class logs.' });
    }
};

// @desc    Get staff log history
// @route   GET /api/timetable/activity-log/history
// @access  Private/Staff
exports.getStaffActivityLogs = async (req, res) => {
    try {
        const { startDate, endDate, month, year } = req.query;
        let query = {};

        // Role-based visibility logic
        if (req.user.role === 'principal' || req.user.role === 'admin') {
            // Principle/Admin see all records across the entire institution
            query = {};
        } else if (req.user.role === 'hod') {
            // HOD sees all logs belonging to their department (regardless of who taught it)
            query = { department: req.user.department };
        } else {
            // Staff see only their own generated logs
            query = { staffId: req.user._id };
        }

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (month && year) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
            query.date = { $gte: startOfMonth, $lte: endOfMonth };
        }

        const logs = await ClassActivityLog.find(query)
            .populate('subjectId', 'name code')
            .populate('staffId', 'fullName')
            .sort({ date: -1, period: -1 })
            .limit(100);

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error('Get activity history error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching history.' });
    }
};

// @desc    Delete activity log
// @route   DELETE /api/timetable/activity-log/:id
// @access  Private/Staff
exports.deleteActivityLog = async (req, res) => {
    try {
        const log = await ClassActivityLog.findById(req.params.id);

        if (!log) {
            return res.status(404).json({ success: false, message: 'Activity log not found.' });
        }

        const userId = req.user._id || req.user.id;

        // Authorization check: 
        // 1. Staff can delete their own logs
        // 2. HOD can delete logs in their department
        // 3. Admin/Principal can delete anything
        const isAuthorized =
            log.staffId.toString() === userId.toString() ||
            (req.user.role === 'hod' && log.department === req.user.department) ||
            ['admin', 'principal'].includes(req.user.role);

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this log.' });
        }

        await ClassActivityLog.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Activity log removed successfully.' });
    } catch (error) {
        console.error('Delete activity log error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting activity log.' });
    }
};
