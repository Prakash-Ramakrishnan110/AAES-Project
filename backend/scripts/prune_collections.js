const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/aaes';

const collectionsToKeep = [
    'users', 'internalmarks', 'reevaluationrequests', 'departments', 
    'classadvisors', 'settings', 'submissions', 'subjects', 
    'assignments', 'studymaterials', 'auditlogs', 'notes', 'aiauditlogs'
];

async function pruneCollections() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log('Current collections:', collectionNames);

        for (const name of collectionNames) {
            if (!collectionsToKeep.includes(name)) {
                console.log(`Dropping collection: ${name}`);
                await mongoose.connection.db.dropCollection(name);
            }
        }

        console.log('Final collections list:');
        const finalCollections = await mongoose.connection.db.listCollections().toArray();
        console.log(finalCollections.map(c => c.name));

        process.exit(0);
    } catch (error) {
        console.error('Error during pruning:', error);
        process.exit(1);
    }
}

pruneCollections();
