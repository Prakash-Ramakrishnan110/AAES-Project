const mongoose = require('mongoose');
const User = require('./models/User'); // Required for population
const Subject = require('./models/Subject'); // Required for population
const StaffAssignmentRequest = require('./models/StaffAssignmentRequest');

async function checkRequests() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const staffId = '699f2adda94de0bf38661994'; // jaseenash
        const requests = await StaffAssignmentRequest.find({ staff: staffId }).populate('requestedBy').populate('subject');

        console.log(`\nFound ${requests.length} assignment requests for jaseenash:`);
        for (const r of requests) {
            console.log(`- ID: ${r._id}`);
            console.log(`  Subject: ${r.subject ? r.subject.name + ' (' + r.subject.code + ')' : 'Unknown'}`);
            console.log(`  Status: ${r.status}`);
            console.log(`  Requested By: ${r.requestedBy ? r.requestedBy.username : 'Unknown'}`);
            console.log(`  Requesting Dept: ${r.requestingDepartment}`);
            console.log('---');
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
checkRequests();
