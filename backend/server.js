const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
    }).catch(err => {
        console.error('MongoDB Connection Error:', err);
    });

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const bulkUploadRoutes = require('./routes/bulkUploadRoutes');
const profileRoutes = require('./routes/profileRoutes');
const advisorRoutes = require('./routes/advisorRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const ccmRoutes = require('./routes/ccmRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes');
const governanceRoutes = require('./routes/governanceRoutes');
const internalRoutes = require('./routes/internalRoutes');
const reEvaluationRoutes = require('./routes/reEvaluationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const studyMaterialRoutes = require('./routes/studyMaterialRoutes');
const aiChatRoutes = require('./routes/aiChatRoutes');
const reportRoutes = require('./routes/reportRoutes');
const cron = require('node-cron');
const { promoteStaleEscalations } = require('./services/escalationEngine');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', bulkUploadRoutes); // Bulk upload under /api/users/bulk-upload
app.use('/api/departments', departmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/ccm', ccmRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/internal', internalRoutes);
app.use('/api/re-evaluation', reEvaluationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/reports', reportRoutes);

const studyResourceRoutes = require('./routes/studyResources');
app.use('/api/study-resources', studyResourceRoutes);

// Daily Cron Job: Promote stale escalations (e.g., every day at midnight)
cron.schedule('0 0 * * *', () => {
    console.log('Running daily escalation promotion check...');
    promoteStaleEscalations();
});


app.get('/api/ping', (req, res) => {
    res.json({
        msg: 'AAES Backend is Running',
        version: '1.0.2',
        timestamp: '2026-03-05 15:00',
        patched: true
    });
});

app.get('/', (req, res) => {
    res.send('AAES Backend is Running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
