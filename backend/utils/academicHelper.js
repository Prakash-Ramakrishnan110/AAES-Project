const User = require('../models/User');
const ClassAdvisor = require('../models/ClassAdvisor');

/**
 * Logic to promote a student to the next semester and update academic year/advisor.
 * Rules:
 * Sem 1 & 2 -> 1st Year
 * Sem 3 & 4 -> 2nd Year
 * Sem 5 & 6 -> 3rd Year
 * Sem 7 & 8 -> 4th Year
 */
const promoteStudent = async (studentId) => {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
        throw new Error('Valid student not found');
    }

    let currentSem = parseInt(student.semester) || 1;
    let nextSem = currentSem + 1;

    if (nextSem > 8) {
        throw new Error('Student has completed all 8 semesters.');
    }

    // Determine New Academic Year string
    let nextYear = student.academicYear;
    if (nextSem === 3) nextYear = '2nd Year';
    else if (nextSem === 5) nextYear = '3rd Year';
    else if (nextSem === 7) nextYear = '4th Year';
    else if (nextSem === 1) nextYear = '1st Year'; // Fallback

    // Find new Advisor for this Dept + Year
    const newAdvisorRecord = await ClassAdvisor.findOne({
        department: student.department,
        academicYear: nextYear
    });

    student.semester = nextSem.toString();
    student.academicYear = nextYear;
    if (newAdvisorRecord) {
        student.classAdvisor = newAdvisorRecord.staff;
    }

    await student.save();
    return student;
};

/**
 * Calculate staff workload based on assigned subjects
 * workload = number of subjects + number of classes (distinct section mappings)
 */
const getStaffWorkload = async (staffId) => {
    const Subject = require('../models/Subject');
    
    // Find subjects where this staff is assigned
    const assignedSubjects = await Subject.find({ staff: staffId });
    
    // In this simplified ERP, let's assume each subject assigned to staff counts as 1.
    // If subjects have multiple sections, we'd count those too.
    const subjectCount = assignedSubjects.length;
    
    let level = 'Low';
    let color = 'green';

    if (subjectCount > 5) {
        level = 'High';
        color = 'red';
    } else if (subjectCount > 3) {
        level = 'Medium';
        color = 'yellow';
    }

    return { 
        count: subjectCount, 
        level, 
        color, 
        subjects: assignedSubjects.map(s => s.name) 
    };
};

module.exports = {
    promoteStudent,
    getStaffWorkload
};
