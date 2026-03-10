const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkPrakash = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: /prakash/i });
        if (!user) {
            console.log('User not found');
        } else {
            console.log(JSON.stringify(user, null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

checkPrakash();
