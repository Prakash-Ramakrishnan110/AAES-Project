const InternalMark = require('../models/InternalMark');
const User = require('../models/User');
const Subject = require('../models/Subject');

exports.processOCRResults = async (req, res) => {
    try {
        const { examResults } = req.body; // Array of { rollNumber, subjectCode, componentName, marks }
        
        const summary = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const result of examResults) {
            try {
                const student = await User.findOne({ rollNumber: result.rollNumber, role: 'student' });
                const subject = await Subject.findOne({ code: result.subjectCode });

                if (!student || !subject) {
                    summary.failed++;
                    summary.errors.push(`Student/Subject not found: ${result.rollNumber}/${result.subjectCode}`);
                    continue;
                }

                // Update or Create Internal Mark
                // Assuming we update the componentMarks array
                const markRecord = await InternalMark.findOne({
                    student: student._id,
                    subject: subject._id,
                    academicYear: result.academicYear || '2024-25',
                    semester: result.semester || '1'
                });

                if (markRecord) {
                    const compIdx = markRecord.componentMarks.findIndex(c => c.componentName === result.componentName);
                    if (compIdx > -1) {
                        markRecord.componentMarks[compIdx].marksObtained = result.marks;
                    } else {
                        markRecord.componentMarks.push({
                            componentName: result.componentName,
                            maxMarks: result.maxMarks || 50,
                            marksObtained: result.marks
                        });
                    }
                    await markRecord.save();
                    summary.success++;
                } else {
                    summary.failed++;
                    summary.errors.push(`Mark record profile not found for ${result.rollNumber}`);
                }
            } catch (err) {
                summary.failed++;
                summary.errors.push(`Processing error for ${result.rollNumber}: ${err.message}`);
            }
        }

        res.json({ message: 'OCR Processing Complete', summary });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
