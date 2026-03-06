const exceljs = require('exceljs');
const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Subject = require('../models/Subject');
const InternalMark = require('../models/InternalMark');
const Attendance = require('../models/Attendance');

/**
 * @desc    Download Consolidated Report as Excel
 * @route   GET /api/reports/download-excel
 */
exports.downloadExcelReport = async (req, res) => {
    try {
        const { department, academicYear, semester, section, reportType } = req.query;

        // Fetch Data
        const query = { role: 'student', department, academicYear, semester, section };
        const students = await User.find(query).select('fullName registerNumber');
        const subjects = await Subject.find({ department, academicYear, semester }).select('name code');

        const workbook = new exceljs.Workbook();
        const sheetTitle = reportType === 'attendance' ? 'Attendance Report' : (reportType === 'internal' ? 'Internal Mark Report' : 'Consolidated Report');
        const worksheet = workbook.addWorksheet(sheetTitle);

        // Headers
        worksheet.mergeCells('A1:O1');
        worksheet.getCell('A1').value = 'AAES – AI Powered Academic Evaluation System';
        worksheet.getCell('A1').font = { bold: true, size: 16 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.mergeCells('A2:O2');
        worksheet.getCell('A2').value = reportType === 'attendance' ? 'Monthly Attendance Report' : (reportType === 'internal' ? 'Internal Assessment Report' : 'Consolidated Academic Report');
        worksheet.getCell('A2').font = { bold: true, size: 14 };
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        worksheet.addRow([`Department: ${department}`, `Year: ${academicYear}`, `Section: ${section}`, `Semester: ${semester}`, `Month: ${req.query.month || 'All'}`]);
        worksheet.addRow([]);

        // Table Header
        const headerRow = ['RollNo', 'Student'];
        if (reportType === 'internal' || !reportType) {
            subjects.forEach(sub => {
                headerRow.push(`${sub.code} CIA1`, `${sub.code} CIA2`);
            });
            headerRow.push('Total Marks', 'Average');
        }
        if (reportType === 'attendance' || !reportType) {
            headerRow.push('Working Days', 'Present Days', 'Attendance %');
        }
        headerRow.push('Risk Status');
        worksheet.addRow(headerRow);

        // Data Rows
        for (const student of students) {
            const row = [student.registerNumber, student.fullName];
            let totalObtained = 0;
            let avg = "0.00";
            let attendancePct = "0.00";
            let totalDays = 0, presentDays = 0;

            if (reportType === 'internal' || !reportType) {
                const studentMarks = await InternalMark.find({ student: student._id, academicYear, semester });
                subjects.forEach(sub => {
                    const mark = studentMarks.find(m => m.subject.toString() === sub._id.toString());
                    const cia1 = mark ? (mark.cia1 || 0) : 0;
                    const cia2 = mark ? (mark.cia2 || 0) : 0;
                    row.push(cia1, cia2);
                    totalObtained += cia1 + cia2;
                });
                avg = subjects.length > 0 ? (totalObtained / (subjects.length * 2)).toFixed(2) : "0.00";
                row.push(totalObtained, avg);
            }

            if (reportType === 'attendance' || !reportType) {
                const attendanceQuery = { 'records.student': student._id };
                if (req.query.month) {
                    const [yearPart, monthPart] = req.query.month.split('-');
                    const startDate = new Date(yearPart, monthPart - 1, 1);
                    const endDate = new Date(yearPart, monthPart, 0);
                    attendanceQuery.date = { $gte: startDate, $lte: endDate };
                }
                const attendances = await Attendance.find(attendanceQuery);
                attendances.forEach(att => {
                    const rec = att.records.find(r => r.student.toString() === student._id.toString());
                    if (rec) { totalDays++; if (rec.status === 'Present') presentDays++; }
                });
                attendancePct = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : "0.00";
                row.push(totalDays, presentDays, attendancePct);
            }

            let risk = 'LOW';
            const avgVal = parseFloat(avg);
            const attVal = parseFloat(attendancePct);
            if (avgVal < 10 || attVal < 75) risk = 'HIGH';
            else if (avgVal < 15 || attVal < 85) risk = 'MEDIUM';

            row.push(risk);
            worksheet.addRow(row);
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${reportType || 'Consolidated'}_Report_${section}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Download Consolidated Report as PDF
 * @route   GET /api/reports/download-pdf
 */
exports.downloadPdfReport = async (req, res) => {
    // Basic PDF implementation
    try {
        const { department, academicYear, semester, section } = req.query;
        const doc = new PDFDocument({ layout: 'landscape' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Consolidated_Report_${section}.pdf`);

        doc.pipe(res);

        doc.fontSize(20).text('AAES – AI Powered Academic Evaluation System', { align: 'center' });
        doc.fontSize(16).text('Internal Assessment Consolidated Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Department: ${department} | Year: ${academicYear} | Section: ${section} | Semester: ${semester}`);
        doc.moveDown();

        doc.text('RollNo | Student | Total | Average | Attendance | Risk');
        doc.moveDown();

        const query = { role: 'student', department, academicYear, semester, section };
        const students = await User.find(query).select('fullName registerNumber');

        for (const student of students) {
            const studentMarks = await InternalMark.find({ student: student._id, academicYear, semester });
            let totalObtained = 0;

            studentMarks.forEach(mark => {
                totalObtained += (mark.cia1 || 0) + (mark.cia2 || 0);
            });

            const subjects = await Subject.find({ department, academicYear, semester });
            const average = subjects.length > 0 ? (totalObtained / (subjects.length * 2)) : 0;

            // Attendance (Monthly)
            const attendanceQuery = { 'records.student': student._id };
            if (req.query.month) {
                const [yearPart, monthPart] = req.query.month.split('-');
                const startDate = new Date(yearPart, monthPart - 1, 1);
                const endDate = new Date(yearPart, monthPart, 0);
                attendanceQuery.date = { $gte: startDate, $lte: endDate };
            }
            const attendances = await Attendance.find(attendanceQuery);
            let present = 0, total = 0;
            attendances.forEach(att => {
                const rec = att.records.find(r => r.student.toString() === student._id.toString());
                if (rec) { total++; if (rec.status === 'Present') present++; }
            });
            const attendancePct = total > 0 ? (present / total) * 100 : 0;

            let risk = 'LOW';
            if (average < 10 || attendancePct < 75) risk = 'HIGH';
            else if (average < 15 || attendancePct < 85) risk = 'MEDIUM';

            doc.text(`${student.registerNumber} | ${student.fullName} | ${totalObtained} | ${average.toFixed(2)} | ${attendancePct.toFixed(2)}% | ${risk}`);
        }

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
