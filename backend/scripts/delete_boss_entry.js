const mongoose = require('mongoose');
const ClassTimetable = require('./models/ClassTimetable');

async function deleteEntry() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const entryId = '69abe94588c9d908b8944fdd';
        const result = await ClassTimetable.findByIdAndDelete(entryId);

        if (result) {
            console.log(`Successfully deleted timetable entry: ${entryId} (Monday, Period 1 for Boss)`);
        } else {
            console.log(`Could not find entry with ID: ${entryId}`);
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
deleteEntry();
