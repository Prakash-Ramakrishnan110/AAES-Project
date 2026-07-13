const mongoose = require('mongoose');

async function checkDbs() {
    try {
        const dbs = ['aaes', 'aaes-erp', 'aaes_db'];
        const collections = ['users', 'departments', 'subjects', 'assignments'];
        
        for (const dbName of dbs) {
            console.log(`--- DATABASE: ${dbName} ---`);
            const conn = await mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`).asPromise();
            for (const col of collections) {
                const count = await conn.db.collection(col).countDocuments();
                console.log(`${col}: ${count}`);
            }
            await conn.close();
        }
        console.log('----------------------------');
    } catch (err) {
        console.error(err);
    }
}

checkDbs();
