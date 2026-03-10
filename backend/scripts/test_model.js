const mongoose = require('mongoose');
require('dotenv').config();
const StudentDocument = require('./models/StudentDocument');

const testModel = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const count = await StudentDocument.countDocuments();
        console.log('Document count:', count);
        const sample = await StudentDocument.findOne();
        console.log('Sample document:', sample);
    } catch (err) {
        console.error('MODEL TEST FAILED:', err);
    } finally {
        await mongoose.connection.close();
    }
};

testModel();
