const InternalPattern = require('../models/InternalPattern');
const InternalMark = require('../models/InternalMark');
const Subject = require('../models/Subject');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { recalculateRiskForStudent } = require('../services/riskEngine');

/**
 * HOD: Create or Update Internal Pattern for a subject
 */
exports.upsertPattern = async (req, res) => {
    try {
        const { subjectId, components, totalInternalMax } = req.body;
        let { academicYear, semester } = req.body;
        const hodId = req.user.id;
        const department = req.user.department;

        // Verify subject belongs to HOD's department
        const subject = await Subject.findOne({ _id: subjectId, department });
        if (!subject) {
            return res.status(403).json({ message: 'Unauthorized: Subject does not belong to your department.' });
        }

        // If client did not send academicYear/semester, fall back to the subject's own values
        if (!academicYear) academicYear = subject.academicYear || '2023-2024';
        if (!semester) semester = subject.semester ? String(subject.semester) : '1';

        // Validate components
        if (!components || components.length === 0) {
            return res.status(400).json({ message: 'At least one component is required.' });
        }

        const calculatedTotal = components.reduce((sum, c) => sum + (Number(c.maxMarks) || 0), 0);
        const total = totalInternalMax || calculatedTotal;

        // Check if pattern is already locked
        let pattern = await InternalPattern.findOne({ subject: subjectId, academicYear, semester });
        if (pattern && pattern.patternLocked) {
            return res.status(400).json({ message: 'Pattern is locked and cannot be modified.' });
        }

        if (pattern) {
            // Update existing
            const previousValue = pattern.toObject();
            pattern.components = components;
            pattern.totalInternalMax = total;
            pattern.version += 1;
            await pattern.save();

            await AuditLog.create({
                action: 'UPDATE_INTERNAL_PATTERN',
                performedBy: hodId,
                role: 'hod',
                targetId: pattern._id,
                targetModel: 'InternalPattern',
                department,
                previousValue,
                newValue: pattern.toObject()
            });
        } else {
            // Create new
            pattern = await InternalPattern.create({
                subject: subjectId,
                department,
                academicYear,
                semester,
                components,
                totalInternalMax: total,
                createdBy: hodId
            });

            await AuditLog.create({
                action: 'CREATE_INTERNAL_PATTERN',
                performedBy: hodId,
                role: 'hod',
                targetId: pattern._id,
                targetModel: 'InternalPattern',
                department,
                newValue: pattern.toObject()
            });
        }

        // Return pattern directly so frontend res.data works
        res.status(201).json(pattern);
    } catch (error) {
        console.error('upsertPattern error:', error);
        res.status(500).json({ message: 'Error saving pattern', error: error.message });
    }
};

/**
 * GET: Fetch pattern for a subject (HOD tool) — returns latest pattern for that subjectId
 */
exports.getPatternBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const pattern = await InternalPattern.findOne({ subject: subjectId })
            .sort({ createdAt: -1 });
        if (!pattern) return res.status(404).json({ message: 'No pattern found for this subject.' });
        res.json(pattern);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pattern', error: error.message });
    }
};

/**
 * HOD: Lock Pattern structure
 */
exports.lockPattern = async (req, res) => {
    try {
        const { patternId } = req.params;
        const hodId = req.user.id;

        const pattern = await InternalPattern.findById(patternId);
        if (!pattern) return res.status(404).json({ message: 'Pattern not found' });

        // Toggle: locked → unlock, unlocked → lock
        const newLocked = !pattern.patternLocked;
        pattern.patternLocked = newLocked;
        if (newLocked) pattern.lockedBy = hodId;
        else pattern.lockedBy = undefined;
        await pattern.save();

        await AuditLog.create({
            action: newLocked ? 'LOCK_INTERNAL_PATTERN' : 'UNLOCK_INTERNAL_PATTERN',
            performedBy: hodId,
            role: 'hod',
            targetId: pattern._id,
            targetModel: 'InternalPattern',
            department: req.user.department,
            details: { patternLocked: newLocked }
        });

        res.json({ message: `Pattern structure ${newLocked ? 'locked' : 'unlocked'} successfully`, pattern });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling structure lock', error: error.message });
    }
};

/**
 * HOD: Lock/Unlock Marks entry
 */
exports.toggleMarksLock = async (req, res) => {
    try {
        const { patternId } = req.params;
        const { locked } = req.body;
        const hodId = req.user.id;

        const pattern = await InternalPattern.findById(patternId);
        if (!pattern) return res.status(404).json({ message: 'Pattern not found' });

        pattern.marksLocked = locked;
        await pattern.save();

        await AuditLog.create({
            action: locked ? 'LOCK_INTERNAL_MARKS' : 'UNLOCK_INTERNAL_MARKS',
            performedBy: hodId,
            role: 'hod',
            targetId: pattern._id,
            targetModel: 'InternalPattern',
            department: req.user.department
        });

        res.json({ message: `Marks ${locked ? 'locked' : 'unlocked'} successfully`, pattern });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling marks lock', error: error.message });
    }
};

/**
 * HOD: Publish/Unpublish Marks
 */
exports.togglePublish = async (req, res) => {
    try {
        const { patternId } = req.params;
        const { published } = req.body;
        const hodId = req.user.id;

        const pattern = await InternalPattern.findById(patternId);
        if (!pattern) return res.status(404).json({ message: 'Pattern not found' });

        pattern.published = published;
        pattern.publishedBy = hodId;
        await pattern.save();

        await AuditLog.create({
            action: published ? 'PUBLISH_INTERNAL_MARKS' : 'UNPUBLISH_INTERNAL_MARKS',
            performedBy: hodId,
            role: 'hod',
            targetId: pattern._id,
            targetModel: 'InternalPattern',
            department: req.user.department
        });

        res.json({ message: `Marks ${published ? 'published' : 'unpublished'} successfully`, pattern });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling publish state', error: error.message });
    }
};

/**
 * STAFF: Enter/Update marks for students
 */
exports.saveMarks = async (req, res) => {
    try {
        const { subjectId, marksData } = req.body;
        const staffId = req.user.id;

        // 1. Verify staff is assigned to this subject
        const subject = await Subject.findOne({ _id: subjectId, staff: staffId });
        if (!subject) {
            return res.status(403).json({ message: 'Unauthorized: You are not assigned to this subject.' });
        }

        // 2. Get pattern by subjectId alone (avoids academicYear/semester mismatch)
        const pattern = await InternalPattern.findOne({ subject: subjectId }).sort({ createdAt: -1 });
        if (!pattern) return res.status(404).json({ message: 'Internal pattern not defined for this subject.' });
        if (pattern.marksLocked) {
            return res.status(400).json({ message: 'Marks entry is locked by HOD.' });
        }

        // Use the pattern's own stored academicYear/semester for consistency
        const academicYear = pattern.academicYear;
        const semester = pattern.semester;

        const results = [];
        for (const entry of marksData) {
            const { studentId, componentMarks } = entry;

            // Validate marks against maxMarks from pattern
            const validatedComponents = componentMarks.map(cm => {
                const patternComp = pattern.components.find(pc => pc.name === cm.name);
                if (!patternComp) throw new Error(`Invalid component name: ${cm.name}`);
                if (cm.marks > patternComp.maxMarks) {
                    throw new Error(`Marks for ${cm.name} (${cm.marks}) exceeds max marks (${patternComp.maxMarks})`);
                }
                return {
                    componentName: cm.name,
                    maxMarks: patternComp.maxMarks,
                    marksObtained: Number(cm.marks) || 0
                };
            });

            const internalMark = await InternalMark.findOneAndUpdate(
                { student: studentId, subject: subjectId, academicYear, semester },
                {
                    $set: {
                        pattern: pattern._id,
                        department: subject.department,
                        componentMarks: validatedComponents,
                        enteredBy: staffId,
                        isDraft: false, // For now assuming direct save as non-draft if submitted
                        submittedToHOD: true
                    }
                },
                { upsert: true, new: true }
            );

            // Trigger Risk Recalculation (non-blocking)
            recalculateRiskForStudent(studentId, semester, academicYear);

            results.push(internalMark);
        }

        res.json({ message: 'Marks saved and risk recalculation triggered.', count: results.length });
    } catch (error) {
        res.status(500).json({ message: 'Error saving marks', error: error.message });
    }
};

/**
 * GET: Get marks for a subject (for Staff/HOD)
 */
exports.getSubjectMarks = async (req, res) => {
    try {
        const { subjectId, academicYear, semester } = req.query;
        const marks = await InternalMark.find({ subject: subjectId, academicYear, semester })
            .populate('student', 'fullName registerNumber');

        const pattern = await InternalPattern.findOne({ subject: subjectId, academicYear, semester });

        res.json({ pattern, marks });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching marks', error: error.message });
    }
};

/**
 * GET: Student view own marks
 */
exports.getStudentMarks = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Get all marks for this student (no year/sem filter needed)
        const marks = await InternalMark.find({ student: studentId })
            .populate('subject', 'name code semester')
            .populate({ path: 'pattern', select: 'published components totalInternalMax' });

        // Filter only published ones
        const publishedMarks = marks.filter(m => m.pattern && m.pattern.published);

        res.json(publishedMarks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student marks', error: error.message });
    }
};
