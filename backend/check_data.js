const mongoose = require('mongoose');

async function checkData() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/aaes');
        
        const collections = ['users', 'departments', 'subjects', 'assignments', 'submissions', 'internalmarks'];
        
        console.log('--- DB COLLECTIONS COUNT ---');
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col).countDocuments();
            console.log(`${col}: ${count}`);
        }
        
        const adminUser = await mongoose.connection.db.collection('users').findOne({ role: 'admin' });
        console.log('Admin User:', adminUser ? 'Found' : 'NOT FOUND');
        
        const activeStudents = await mongoose.connection.db.collection('users').countDocuments({ role: 'student', isActive: true });
        console.log('Active Students:', activeStudents);

        const activeStaff = await mongoose.connection.db.collection('users').countDocuments({ role: 'staff', isActive: true });
        console.log('Active Staff:', activeStaff);

        console.log('----------------------------');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkData();
