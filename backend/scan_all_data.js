const mongoose = require('mongoose');

async function scanAll() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/aaes');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('--- ALL COLLECTIONS IN aaes ---');
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            if (count > 0) {
                console.log(`${col.name}: ${count}`);
            }
        }
        console.log('-------------------------------');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

scanAll();
