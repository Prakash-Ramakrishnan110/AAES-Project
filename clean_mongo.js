const fs = require('fs');
const path = require('path');

const lockFiles = [
    'C:\\Program Files\\MongoDB\\Server\\8.2\\data\\mongod.lock',
    'C:\\Program Files\\MongoDB\\Server\\8.2\\data\\WiredTiger.lock'
];

lockFiles.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            console.log(`Deleting ${file}...`);
            fs.unlinkSync(file);
            console.log('Deleted.');
        } else {
            console.log(`${file} does not exist.`);
        }
    } catch (err) {
        console.error(`Error deleting ${file}: ${err.message}`);
    }
});
