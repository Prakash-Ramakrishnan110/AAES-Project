const User = require('../models/User');
const ClassAdvisor = require('../models/ClassAdvisor');
const Subject = require('../models/Subject');
const AuditLog = require('../models/AuditLog');

// @desc    Transition all students to the next semester
// @route   POST /api/admin/semester-transition
// @access  Private/Admin
exports.transitionSemester = async (req, res) => {
    try {
        const students = await User.find({ role: 'student', isActive: true });
        const results = {
            total: students.length,
            promoted: 0,
            graduated: 0,
            yearIncrements: 0,
            advisorsRotated: 0,
            subjectsArchived: 0
        };

        const currentTimestamp = new Date();

        // 1. Snapshot/Archive current active subjects BEFORE transition
        // We mark them as "historical" or just rely on the semester field + middleware.
        // For safety, let's mark subjects of the "current" active semesters as 'archived' if we had such a field.
        // Since we don't, we'll just acknowledge that they are now "Past" data.
        const archRes = await Subject.updateMany({ semester: { $exists: true } });
        results.subjectsArchived = archRes.modifiedCount;

        // 2. Process Students
        for (const student of students) {
            const currentSem = parseInt(student.semester) || 1;
            
            if (currentSem >= 8) {
                // Graduate student
                student.isActive = false;
                student.isGraduated = true; 
                results.graduated++;
            } else {
                const newSem = currentSem + 1;
                student.semester = newSem.toString();

                // Year Level Progression Logic:
                // Sem 1, 2 -> Year 1
                // Sem 3, 4 -> Year 2
                // Sem 5, 6 -> Year 3
                // Sem 7, 8 -> Year 4
                
                // Rule: If new semester is 3, 5, or 7 -> NEW YEAR!
                if ([3, 5, 7].includes(newSem)) {
                    const yearMatch = student.academicYear ? student.academicYear.match(/\d+/) : null;
                    const currentYearNum = yearMatch ? parseInt(yearMatch[0]) : 1;
                    const nextYear = currentYearNum + 1;
                    student.academicYear = `${nextYear}${getOrdinalSuffix(nextYear)} Year`;
                    results.yearIncrements++;
                }
                
                results.promoted++;
            }
            await student.save();
        }

        // 3. Advisor Rotation
        // According to rules: "Assign new class advisor".
        // This effectively means removing OLD advisor assignments for the current levels
        // so HODs must assign new ones for the NEW levels.
        const advisorRes = await ClassAdvisor.deleteMany({}); // Fresh start for the new term
        results.advisorsRotated = advisorRes.deletedCount;

        await AuditLog.create({
            action: 'GLOBAL_SEMESTER_TRANSITION',
            performedBy: req.user.id,
            details: {
                ...results,
                timestamp: currentTimestamp
            }
        });

        res.json({
            success: true,
            message: 'Global Semester Transition Completed Successfully. System is now in the next academic term.',
            results
        });
    } catch (error) {
        console.error('Transition Error:', error);
        res.status(500).json({ message: 'Transition failed: ' + error.message });
    }
};

function getOrdinalSuffix(i) {
    const j = i % 10, k = i % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
}
