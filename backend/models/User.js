const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // Profile Fields
    fullName: { type: String },
    phone: { type: String },
    profileImage: { type: String, default: '' },
    bloodGroup: { type: String },
    schooling: { type: String },
    currentCgpa: { type: String },
    historyOfArrears: { type: String },

    // Role-Specific IDs
    staffId: { type: String }, // For Staff
    registerNumber: { type: String }, // For Student

    role: {
        type: String,
        enum: ['admin', 'hod', 'staff', 'student', 'principal', 'lab-assistant'],
        required: true
    },

    department: { type: String }, // For HOD, Staff, Student
    academicYear: { type: String }, // For Staff, Student
    semester: { type: String }, // For Student
    batch: { type: String }, // For Student
    section: { type: String }, // For Student
    classAdvisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For Student
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 1-to-1 Mentor (For Student)

    // Governance & Security Enhancements
    requiresPasswordChange: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastLogin: { type: Date },

    createdAt: { type: Date, default: Date.now },

    // User Preferences
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true },
            assignments: { type: Boolean, default: true },
            announcements: { type: Boolean, default: true },
            academicAlerts: { type: Boolean, default: true },
            teachingAlerts: { type: Boolean, default: true },
            deptAlerts: { type: Boolean, default: true },
            systemAlerts: { type: Boolean, default: true }
        },
        appearance: {
            theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
            fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
            compactView: { type: Boolean, default: false }
        },
        privacy: {
            showEmail: { type: Boolean, default: true },
            showPhone: { type: Boolean, default: false }
        }
    }
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
