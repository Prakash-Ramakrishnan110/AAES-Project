const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    fullName: { type: String },
    registerNumber: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'hod', 'staff', 'student', 'principal', 'lab-assistant'],
        required: true
    },
    department: { type: String },
    phone: { type: String },
    bloodGroup: { type: String },
    schooling: { type: String },
    currentCgpa: { type: Number, default: 0 },
    historyOfArrears: { type: Number, default: 0 },
    batch: { type: String },
    section: { type: String },
    semester: { type: String },
    academicYear: { type: String },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    requiresPasswordChange: { type: Boolean, default: false },
    preferences: {
        aiPulse: { type: Boolean, default: true },
        darkMode: { type: Boolean, default: false },
        notifications: { type: Boolean, default: true },
        auditLogging: { type: Boolean, default: true },
        timezone: { type: String, default: 'Asia/Kolkata (GMT+5:30)' },
        language: { type: String, default: 'English (US)' }
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Password Hashing Middleware
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare Password Method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
