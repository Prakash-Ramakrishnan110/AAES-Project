const fs = require('fs');
let code = fs.readFileSync('backend/controllers/analyticsController.js', 'utf-8');
code = code.replace(/department: dept._id/g, 'department: dept.name');

const newFunc = `
// @desc    Get staff performance analytics for HOD
// @route   GET /api/analytics/staff/performance
// @access  Private/HOD
const getStaffPerformance = async (req, res) => {
    try {
        const department = req.user.department;
        const staffMembers = await User.find({ role: 'staff', department, isActive: true });
        const result = [];
        for (const staff of staffMembers) {
            const subjects = await Subject.find({ staff: staff._id });
            const marks = await InternalMark.find({ subject: { $in: subjects.map(s => s._id) } });
            const avgMarks = marks.length > 0
                ? marks.reduce((acc, curr) => acc + curr.totalInternalMarks, 0) / marks.length
                : 0;
            result.push({
                staff: staff.fullName || staff.username,
                avgMarks: parseFloat(avgMarks.toFixed(2))
            });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
`;

code = code.replace('module.exports = {', newFunc + '\nmodule.exports = {\n    getStaffPerformance,');
fs.writeFileSync('backend/controllers/analyticsController.js', code);
console.log('Done');
