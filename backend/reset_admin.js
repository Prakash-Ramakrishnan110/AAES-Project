const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.connection.db.collection('users');
        const admin = await User.findOne({ username: 'admin' });
        
        if (!admin) {
            console.log('Admin not found');
            process.exit(1);
        }
        
        const isMatch = await bcrypt.compare('admin', admin.password);
        console.log('Login with "admin":', isMatch);
        
        if (!isMatch) {
            console.log('Resetting admin password to "admin"...');
            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash('admin', salt);
            await User.updateOne({ _id: admin._id }, { $set: { password: newHash } });
            console.log('Password reset successful');
        }
        
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

testLogin();
