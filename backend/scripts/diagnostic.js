const mongoose = require('mongoose');
require('dotenv').config();
const { uploadDocument, getMyDocuments } = require('./controllers/documentController');
const User = require('./models/User');

const runDiagnostic = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ role: 'student' });
        if (!user) {
            console.log('No student user found for testing.');
            return;
        }

        console.log('Testing with User:', user.email);

        // Mock req/res for getMyDocuments
        const mockReqGet = { user: { _id: user._id } };
        const mockResGet = {
            status: function(code) { this.statusCode = code; return this; },
            json: function(data) { this.data = data; console.log('GET /me Result:', this.statusCode, JSON.stringify(data, null, 2)); }
        };

        await getMyDocuments(mockReqGet, mockResGet);
        console.log('--- GET DIAGNOSTIC COMPLETE ---');

        // Mock req/res for uploadDocument
        const mockReqPost = {
            user: { _id: user._id, department: user.department },
            body: { 
                category: 'Personal', 
                documentType: 'Aadhaar Card', 
                semester: '5', 
                academicYear: '2023-2024' 
            },
            file: { filename: 'test-file.pdf' }
        };
        const mockResPost = {
            status: function(code) { this.statusCode = code; return this; },
            json: function(data) { this.data = data; console.log('POST /upload Result:', this.statusCode, JSON.stringify(data, null, 2)); return this; }
        };

        await uploadDocument(mockReqPost, mockResPost);
        console.log('--- POST DIAGNOSTIC COMPLETE ---');

    } catch (err) {
        console.error('DIAGNOSTIC CRASHED:', err);
    } finally {
        await mongoose.connection.close();
    }
};

runDiagnostic();
