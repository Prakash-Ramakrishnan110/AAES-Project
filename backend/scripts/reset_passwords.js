const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
    try {
        await mongoose.connect('mongodb://localhost:27017/aaes');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const result = await mongoose.connection.db.collection('users').updateMany(
            {}, 
            { $set: { password: hashedPassword, isActive: true } }
        );

        console.log(`Updated ${result.modifiedCount} users' passwords to 'password123'`);
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

resetPasswords();
