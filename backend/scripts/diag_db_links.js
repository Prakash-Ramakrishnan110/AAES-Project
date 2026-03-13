const mongoose = require('mongoose');
require('dotenv').config();

const StudentDocument = require('../models/StudentDocument');

async function diagnostic() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const timestamp = '1773132353363';
        const doc = await StudentDocument.findOne({ fileUrl: new RegExp(timestamp) });
        
        if (doc) {
            console.log(`URL: "${doc.fileUrl}"`);
            const codes = [];
            for (let i = 0; i < doc.fileUrl.length; i++) {
                codes.push(`${doc.fileUrl[i]}(${doc.fileUrl.charCodeAt(i)})`);
            }
            console.log('Char Codes:', codes.join(' '));
        } else {
            console.log('Document not found');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

diagnostic();
