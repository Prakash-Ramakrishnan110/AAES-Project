const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const StudentDocument = require('./models/StudentDocument');
require('dotenv').config();

async function migrateFolders() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const students = await User.find({ role: 'student' });
        const uploadsBase = path.resolve(__dirname, 'uploads');

        for (const student of students) {
            const regNumber = student.registerNumber?.toLowerCase();
            if (!regNumber) continue;

            const namePart = (student.fullName || 'Student').trim().replace(/[^a-zA-Z0-9]/g, '_');
            const newIdentifier = `${namePart}_${regNumber}`.toLowerCase();
            
            const oldPath = path.join(uploadsBase, regNumber);
            const newPath = path.join(uploadsBase, newIdentifier);

            if (fs.existsSync(oldPath) && oldPath !== newPath) {
                console.log(`Migrating ${regNumber} -> ${newIdentifier}`);
                
                if (!fs.existsSync(newPath)) {
                    fs.renameSync(oldPath, newPath);
                } else {
                    // Merge if new path already exists
                    const files = fs.readdirSync(oldPath);
                    for (const file of files) {
                        const oldFilePath = path.join(oldPath, file);
                        const newFilePath = path.join(newPath, file);
                        if (!fs.existsSync(newFilePath)) {
                            fs.renameSync(oldFilePath, newFilePath);
                        }
                    }
                    fs.rmdirSync(oldPath, { recursive: true });
                }

                // Update database records
                const docs = await StudentDocument.find({ studentId: student._id });
                for (const doc of docs) {
                    if (doc.fileUrl.includes(`/${regNumber}/`)) {
                        const newUrl = doc.fileUrl.replace(`/${regNumber}/`, `/${newIdentifier}/`);
                        doc.fileUrl = newUrl;
                        await doc.save();
                        console.log(`  Updated DB URL: ${newUrl}`);
                    }
                }
            }
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateFolders();
