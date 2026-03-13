const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Submission = require('../models/Submission');

const MONGO_URI = 'mongodb://127.0.0.1:27017/aaes';
const UPLOADS_DIR = path.join(__dirname, '../uploads');

async function fixSpaces() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const submissions = await Submission.find({ fileUrl: { $regex: /\s/ } });
        console.log(`Found ${submissions.length} submissions with spaces in URL`);

        for (const sub of submissions) {
            const oldUrl = sub.fileUrl;
            const newUrl = oldUrl.replace(/\s+/g, '-');
            
            const oldPath = path.join(__dirname, '..', oldUrl);
            const newPath = path.join(__dirname, '..', newUrl);

            console.log(`Fixing: "${oldUrl}" -> "${newUrl}"`);

            if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
                console.log(`  Renamed file on disk`);
            } else {
                console.warn(`  Warning: File not found on disk: ${oldPath}`);
            }

            sub.fileUrl = newUrl;
            await sub.save();
            console.log(`  Updated database record`);
        }

        console.log('Migration complete');
    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        await mongoose.connection.close();
    }
}

fixSpaces();
