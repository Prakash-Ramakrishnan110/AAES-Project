const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkAll() {
    const dbs = ['aaes', 'aaes-erp', 'aaes_db'];
    for (const dbName of dbs) {
        console.log(`Checking ${dbName}...`);
        try {
            const conn = await mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`).asPromise();
            const count = await conn.db.collection('submissions').countDocuments();
            console.log(`Count: ${count}`);
            const subs = await conn.db.collection('submissions').find({}).toArray();
            subs.forEach(s => console.log(`  - ${s._id}`));
            await conn.close();
        } catch (err) {
            console.error(`Error ${dbName}: ${err.message}`);
        }
    }
    process.exit(0);
}
checkAll();
