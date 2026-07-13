const mongoose = require('mongoose');

async function listDbs() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017');
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('--- DATABASES ---');
        dbs.databases.forEach(db => console.log(db.name));
        console.log('-----------------');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

listDbs();
