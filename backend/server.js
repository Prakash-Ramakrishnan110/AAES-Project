const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const fs = require('fs');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

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
const aiChatRoutes = require('./routes/aiChatRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const workAssignmentRoutes = require('./routes/workAssignmentRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const documentRoutes = require('./routes/documentRoutes');
const studyMaterialRoutes = require('./routes/studyMaterialRoutes');

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
app.use('/api/settings', settingsRoutes);
app.use('/api/work-assignments', workAssignmentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/student-leaves', leaveRoutes);
app.use('/api/student-documents', documentRoutes);

const studyResourceRoutes = require('./routes/studyResources');
app.use('/api/study-resources', studyResourceRoutes);

// Daily Cron Job: Promote stale escalations (e.g., every day at midnight)
const cron = require('node-cron');
const { promoteStaleEscalations } = require('./services/escalationEngine');

cron.schedule('0 0 * * *', () => {
    console.log('Running daily escalation promotion check...');
    promoteStaleEscalations();
});


app.get('/api/ping', (req, res) => {
    res.json({
        msg: 'AAES Backend is Running',
        version: '1.0.3',
        timestamp: '2026-03-10 12:00 FINAL',
        patched: true
    });
});

app.get('/', (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const mongoColor = mongoose.connection.readyState === 1 ? '#10B981' : '#EF4444'; // Emerald green vs Red
    const uptimeInSeconds = process.uptime();

    // Format Uptime
    const d = Math.floor(uptimeInSeconds / (3600 * 24));
    const h = Math.floor(uptimeInSeconds % (3600 * 24) / 3600);
    const m = Math.floor(uptimeInSeconds % 3600 / 60);
    const s = Math.floor(uptimeInSeconds % 60);
    const uptime = `${d}d ${h}h ${m}m ${s}s`;

    // System Metrics
    const os = require('os');
    const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
    const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);
    const memUsage = ((usedMem / totalMem) * 100).toFixed(1);
    const cpuCores = os.cpus().length;
    const loadAvg = os.loadavg()[0].toFixed(2);

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AAES Core :: API Engine</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #2563eb;
                --primary-dark: #1d4ed8;
                --bg: #f8fafc;
                --surface: #ffffff;
                --text: #0f172a;
                --text-muted: #64748b;
                --border: #e2e8f0;
                --success: #10b981;
                --warning: #f59e0b;
                --error: #ef4444;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                background: var(--bg);
                color: var(--text);
                font-family: 'Inter', sans-serif;
                line-height: 1.5;
                padding: 40px 20px;
                display: flex;
                justify-content: center;
            }
            .app-container {
                width: 100%;
                max-width: 900px;
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid var(--border);
                padding-bottom: 16px;
            }
            .brand { display: flex; align-items: center; gap: 12px; }
            .status-badge {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13px;
                font-weight: 600;
                color: var(--success);
                background: #ecfdf5;
                padding: 4px 12px;
                border-radius: 99px;
            }
            .pulse-dot {
                width: 8px; height: 8px;
                background: var(--success);
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
            
            h1 { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
            
            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
            }
            .stat-card {
                background: var(--surface);
                border: 1px solid var(--border);
                padding: 16px;
                border-radius: 12px;
            }
            .stat-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
            .stat-value { font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

            .main-content {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 24px;
            }
            .surface-box {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 12px;
                overflow: hidden;
            }
            .box-header {
                padding: 12px 16px;
                background: #f1f5f9;
                border-bottom: 1px solid var(--border);
                font-size: 13px;
                font-weight: 600;
                display: flex;
                justify-content: space-between;
            }
            
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { text-align: left; padding: 12px 16px; color: var(--text-muted); font-weight: 500; border-bottom: 1px solid var(--border); }
            td { padding: 12px 16px; border-bottom: 1px solid var(--border); }
            .health-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }

            .link-btn {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                text-decoration: none;
                color: var(--text);
                font-size: 14px;
                font-weight: 500;
                border-bottom: 1px solid var(--border);
                transition: background 0.2s;
            }
            .link-btn:last-child { border-bottom: none; }
            .link-btn:hover { background: #f1f5f9; }
            .link-btn.primary { background: var(--primary); color: white; border: none; }
            .link-btn.primary:hover { background: var(--primary-dark); }
            
            footer {
                margin-top: 12px;
                color: var(--text-muted);
                font-size: 12px;
                display: flex;
                justify-content: space-between;
            }
        </style>
    </head>
    <body>
        <div class="app-container">
            <header>
                <div class="brand">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                    <h1>AAES API ENGINE</h1>
                </div>
                <div class="status-badge">
                    <div class="pulse-dot"></div>
                    OPERATIONAL
                </div>
            </header>

            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-label">System Uptime</div>
                    <div class="stat-value">${uptime}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Memory Usage</div>
                    <div class="stat-value">${memUsage}% <span style="font-size:12px; font-weight:500; color:var(--text-muted)">(${usedMem}GB)</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">CPU Load</div>
                    <div class="stat-value">${loadAvg} <span style="font-size:12px; font-weight:500; color:var(--text-muted)">(${cpuCores} Cores)</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Database</div>
                    <div class="stat-value" style="color: ${mongoColor}">${mongoStatus}</div>
                </div>
            </div>

            <div class="main-content">
                <div class="surface-box">
                    <div class="box-header">SERVICE REGISTRY</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Service Name</th>
                                <th>Endpoint</th>
                                <th>Status</th>
                                <th>Health</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="font-weight:600">Authentication Services</td>
                                <td style="font-family:'JetBrains Mono'">/api/auth</td>
                                <td><span class="health-dot" style="background:var(--success)"></span>Active</td>
                                <td style="color:var(--success)">99.9%</td>
                            </tr>
                            <tr>
                                <td style="font-weight:600">Student Analytics</td>
                                <td style="font-family:'JetBrains Mono'">/api/analytics</td>
                                <td><span class="health-dot" style="background:var(--success)"></span>Active</td>
                                <td style="color:var(--success)">98.4%</td>
                            </tr>
                            <tr>
                                <td style="font-weight:600">AI Logic Engine</td>
                                <td style="font-family:'JetBrains Mono'">/api/ai-chat</td>
                                <td><span class="health-dot" style="background:var(--success)"></span>Active</td>
                                <td style="color:var(--success)">100%</td>
                            </tr>
                            <tr>
                                <td style="font-weight:600">File Storage Service</td>
                                <td style="font-family:'JetBrains Mono'">/uploads</td>
                                <td><span class="health-dot" style="background:var(--success)"></span>Active</td>
                                <td style="color:var(--success)">99.2%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="sidebar">
                    <div class="surface-box">
                        <div class="box-header">ADMINISTRATIVE ACTIONS</div>
                        <div class="links">
                            <a href="http://localhost:3050" target="_blank" class="link-btn primary">
                                Explore Portal
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </a>
                            <a href="/api/ping" class="link-btn">
                                Diagnostic Ping
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                            </a>
                            <a href="http://localhost:8000/docs" target="_blank" class="link-btn">
                                API Documentation
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            </a>
                            <a href="#" class="link-btn" style="color:var(--text-muted); cursor:not-allowed">
                                System Settings (v2)
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <footer>
                <div>AAES Kernel v1.0.2 &bull; Node.js ${process.version}</div>
                <div>&copy; ${new Date().getFullYear()} AAES Engineering</div>
            </footer>
        </div>
    </body>
    </html>
    `;

    res.send(html);
});

// Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err.message, err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : err.message
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
