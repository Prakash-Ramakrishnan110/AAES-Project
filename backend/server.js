const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
// app.use(helmet({
//     crossOriginResourcePolicy: false,
//     contentSecurityPolicy: false,
//     frameguard: false
// }));
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Limit each IP to 2000 requests per windowMs (Higher for dev)
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', limiter);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/api/uploads', express.static(uploadsDir));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
    }).catch(err => {
        console.error('MongoDB Connection Error:', err);
    });

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const profileRoutes = require('./routes/profileRoutes');
const aiChatRoutes = require('./routes/aiChatRoutes');
const notesRoutes = require('./routes/notesRoutes');
const aiEvaluationRoutes = require('./routes/aiEvaluationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const internalRoutes = require('./routes/internalRoutes');
const ocrController = require('./controllers/ocrController');
const { protect, authorize } = require('./middleware/authMiddleware');

// Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/ai-evaluation', aiEvaluationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/internal', internalRoutes);

// OCR Integration Endpoint
app.post('/api/exam/ocr/process', protect, authorize('admin', 'hod', 'staff'), ocrController.processOCRResults);

// Study Materials for Student Dashboard & Resources
const notesController = require('./controllers/notesController');
app.get('/api/study-materials', protect, authorize('student'), notesController.getStudentStudyMaterials);


// System Metrics API for Dynamic Dashboard
app.get('/api/system/metrics', (req, res) => {
    const os = require('os');
    const uptimeInSeconds = process.uptime();
    const d = Math.floor(uptimeInSeconds / (3600 * 24));
    const h = Math.floor(uptimeInSeconds % (3600 * 24) / 3600);
    const m = Math.floor(uptimeInSeconds % 3600 / 60);
    const s = Math.floor(uptimeInSeconds % 60);
    const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
    const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);

    res.json({
        uptime: `${d}d ${h}h ${m}m ${s}s`,
        memUsage: ((usedMem / totalMem) * 100).toFixed(1),
        usedMem: usedMem + 'GB',
        loadAvg: os.loadavg()[0].toFixed(2),
        cpuCores: os.cpus().length,
        mongoStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        mongoColor: mongoose.connection.readyState === 1 ? '#10B981' : '#EF4444'
    });
});

app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AAES Core :: API Engine</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
        <script src="https://unpkg.com/@lucide/web"></script>
        <style>
            :root {
                --primary: #4F46E5;
                --primary-glow: rgba(79, 70, 229, 0.15);
                --bg: #F8FAFC;
                --surface: rgba(255, 255, 255, 0.8);
                --border: rgba(0, 0, 0, 0.05);
                --text: #1E293B;
                --text-muted: #64748B;
                --success: #10B981;
                --warning: #F59E0B;
                --error: #EF4444;
            }

            * { box-sizing: border-box; margin: 0; padding: 0; }
            
            body {
                background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%);
                color: var(--text);
                font-family: 'Plus Jakarta Sans', sans-serif;
                min-height: 100vh;
                padding: 40px 20px;
                display: flex;
                justify-content: center;
                overflow-x: hidden;
            }

            .app-container {
                width: 100%;
                max-width: 1000px;
                display: flex;
                flex-direction: column;
                gap: 24px;
                animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                backdrop-filter: blur(20px);
                background: var(--surface);
                padding: 24px 32px;
                border: 1px solid var(--border);
                border-radius: 24px;
                box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
            }

            .brand { display: flex; align-items: center; gap: 16px; }
            .brand h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: var(--text); }

            .status-badge {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 13px;
                font-weight: 700;
                color: var(--success);
                background: rgba(16, 185, 129, 0.08);
                padding: 8px 18px;
                border-radius: 99px;
                border: 1px solid rgba(16, 185, 129, 0.1);
            }

            .pulse-dot {
                width: 8px; height: 8px;
                background: var(--success);
                border-radius: 50%;
                box-shadow: 0 0 12px var(--success);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(0.9); opacity: 0.6; }
                50% { transform: scale(1.3); opacity: 1; }
                100% { transform: scale(0.9); opacity: 0.6; }
            }

            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
            }

            .stat-card {
                background: var(--surface);
                backdrop-filter: blur(20px);
                border: 1px solid var(--border);
                padding: 24px;
                border-radius: 24px;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1);
                border-color: var(--primary);
            }

            .stat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; }
            .stat-value { font-size: 22px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); }

            .pipeline-section {
                background: var(--surface);
                backdrop-filter: blur(20px);
                border: 1px solid var(--border);
                border-radius: 32px;
                padding: 32px;
                position: relative;
                overflow: hidden;
                box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
            }

            .pipeline-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
            }

            .pipeline-header h2 { font-size: 15px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; display: flex; align-items: center; gap: 12px; color: var(--primary); }

            .pipeline-steps {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: 12px;
                position: relative;
            }

            .pipeline-step {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                position: relative;
                z-index: 2;
                opacity: 0.3;
                transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .pipeline-step.active { opacity: 1; transform: scale(1.05); }
            .pipeline-step.completed { opacity: 1; }
            .pipeline-step.completed .icon-container { background: var(--success); border-color: var(--success); color: white; }

            .icon-container {
                width: 52px;
                height: 52px;
                background: #F1F5F9;
                border: 2px solid var(--border);
                border-radius: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.4s ease;
                color: var(--text-muted);
            }

            .pipeline-step.active .icon-container {
                border-color: var(--primary);
                background: var(--primary);
                color: white;
                box-shadow: 0 10px 25px -5px var(--primary-glow);
            }

            .step-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); text-align: center; }
            .pipeline-step.active .step-label { color: var(--text); font-weight: 800; }

            .connector {
                position: absolute;
                top: 26px;
                left: 6%;
                right: 6%;
                height: 3px;
                background: #F1F5F9;
                border-radius: 99px;
                z-index: 1;
                overflow: hidden;
            }

            .connector-progress {
                height: 100%;
                background: var(--primary);
                width: 0%;
                transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 0 10px var(--primary-glow);
            }

            #flow-particle {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 10px;
                height: 10px;
                background: #fff;
                border: 2px solid var(--primary);
                border-radius: 50%;
                box-shadow: 0 0 12px var(--primary-glow);
                z-index: 2;
                transition: left 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .main-content {
                display: grid;
                grid-template-columns: 2fr 1.2fr;
                gap: 24px;
            }

            .surface-box {
                background: var(--surface);
                backdrop-filter: blur(20px);
                border: 1px solid var(--border);
                border-radius: 30px;
                overflow: hidden;
                box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
            }

            .box-header {
                padding: 18px 28px;
                background: rgba(0, 0, 0, 0.02);
                border-bottom: 1px solid var(--border);
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                color: var(--text-muted);
            }

            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 18px 28px; color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid var(--border); }
            td { padding: 18px 28px; font-size: 14px; font-weight: 600; border-bottom: 1px solid var(--border); transition: background 0.3s; }
            tr:hover td { background: rgba(0,0,0,0.01); }

            .health-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(16, 185, 129, 0.08);
                color: var(--success);
                padding: 5px 12px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 800;
            }

            .link-btn {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 18px 28px;
                text-decoration: none;
                color: var(--text);
                font-size: 15px;
                font-weight: 600;
                border-bottom: 1px solid var(--border);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .link-btn:last-child { border-bottom: none; }
            .link-btn:hover { background: rgba(0,0,0,0.02); color: var(--primary); transform: translateX(6px); }
            .link-btn.primary { background: var(--primary); color: white; border: none; }
            .link-btn.primary:hover { background: #4338CA; transform: translateY(-2px); box-shadow: 0 10px 20px -5px var(--primary-glow); }

            #neural-bg {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                z-index: -1;
                pointer-events: none;
                background: radial-gradient(circle at 50% 50%, #fff 0%, #F1F5F9 100%);
            }

            footer {
                margin-top: 12px;
                color: var(--text-muted);
                font-size: 11px;
                font-weight: 700;
                display: flex;
                justify-content: space-between;
                padding: 0 20px;
            }
        </style>
    </head>
    <body>
        <div id="neural-bg"></div>
        <div class="app-container">
                <div class="header-main" style="display:flex; justify-content:space-between; width:100%; align-items:center">
                    <div class="brand">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                        <h1>AAES API ENGINE <span style="font-size:12px; opacity:0.6; margin-left:10px">v1.0.7-L</span></h1>
                    </div>
                    <div style="display:flex; gap:12px; align-items:center">
                        <a href="http://127.0.0.1:8000/docs" target="_blank" style="text-decoration:none; padding:8px 16px; background:var(--primary); color:white; border-radius:8px; font-size:12px; font-weight:700; display:flex; align-items:center; gap:8px">
                            <i data-lucide="external-link" style="width:14px"></i> AI SERVICE DOCS
                        </a>
                        <div class="status-badge">
                            <div class="pulse-dot"></div>
                            SYSTEM OPERATIONAL
                        </div>
                    </div>
                </div>

            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-label">System Uptime</div>
                    <div class="stat-value" id="val-uptime">0d 0h 0m 0s</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Neural Load</div>
                    <div class="stat-value" id="val-load">0.00 <span style="font-size:11px; font-weight:500; color:var(--text-muted)">CORES: 0</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Memory Hub</div>
                    <div class="stat-value" id="val-mem">0% <span style="font-size:11px; font-weight:500; color:var(--text-muted)">0GB</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Database</div>
                    <div class="stat-value" id="val-db" style="color: var(--success)">Connected</div>
                </div>
            </div>

            <div class="pipeline-section">
                <div class="pipeline-header">
                    <h2><i data-lucide="activity"></i> Neural Pipeline Stream</h2>
                    <div class="status-badge" style="color: var(--primary); background: rgba(79, 70, 229, 0.08); border-color: rgba(79, 70, 229, 0.1)">
                        <span id="pipeline-status">READY FOR UPLOAD</span>
                    </div>
                </div>
                
                <div class="connector">
                    <div class="connector-progress" id="progress-bar"></div>
                    <div id="flow-particle" style="left: 0%"></div>
                </div>

                <div class="pipeline-steps">
                    <div class="pipeline-step" id="step-0"><div class="icon-container"><i data-lucide="shield"></i></div><span class="step-label">Shield</span></div>
                    <div class="pipeline-step" id="step-1"><div class="icon-container"><i data-lucide="eye"></i></div><span class="step-label">Vision</span></div>
                    <div class="pipeline-step" id="step-2"><div class="icon-container"><i data-lucide="box"></i></div><span class="step-label">Diagram</span></div>
                    <div class="pipeline-step" id="step-3"><div class="icon-container"><i data-lucide="file-text"></i></div><span class="step-label">OCR</span></div>
                    <div class="pipeline-step" id="step-4"><div class="icon-container"><i data-lucide="zap"></i></div><span class="step-label">Logic</span></div>
                    <div class="pipeline-step" id="step-5"><div class="icon-container"><i data-lucide="git-merge"></i></div><span class="step-label">Integrity</span></div>
                    <div class="pipeline-step" id="step-6"><div class="icon-container"><i data-lucide="bar-chart-3"></i></div><span class="step-label">Grading</span></div>
                    <div class="pipeline-step" id="step-7"><div class="icon-container"><i data-lucide="sparkles"></i></div><span class="step-label">Insights</span></div>
                </div>
            </div>

            <div class="main-content">
                <div class="surface-box">
                    <div class="box-header">Infrastructure Services</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Registry</th>
                                <th>Protocol</th>
                                <th>Status</th>
                                <th>Stability</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="font-weight:700">Auth Cluster</td>
                                <td style="color:var(--primary); font-family:'JetBrains Mono'; font-size:12px">/api/auth</td>
                                <td><div class="health-badge">OPERATIONAL</div></td>
                                <td style="font-weight:700">99.9%</td>
                            </tr>
                            <tr>
                                <td style="font-weight:700">Analytics Hub</td>
                                <td style="color:var(--primary); font-family:'JetBrains Mono'; font-size:12px">/api/analytics</td>
                                <td><div class="health-badge">OPERATIONAL</div></td>
                                <td style="font-weight:700">98.4%</td>
                            </tr>
                            <tr>
                                <td style="font-weight:700">Vision Engine</td>
                                <td style="color:var(--primary); font-family:'JetBrains Mono'; font-size:12px">/api/ai-evaluation</td>
                                <td><div class="health-badge">OPERATIONAL</div></td>
                                <td style="font-weight:700">100%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="sidebar">
                    <div class="surface-box">
                        <div class="box-header">OPERATIONAL ACCESS</div>
                        <div class="links">
                            <a href="http://localhost:3050" target="_blank" class="link-btn primary">
                                Launch Student Portal <i data-lucide="external-link" style="width:16px"></i>
                            </a>
                            <a href="/api/ping" class="link-btn">
                                Diagnostic Heartbeat <i data-lucide="activity" style="width:16px"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <footer>
                <div>AAES KERNEL v1.0.6 &bull; DYNAMIC MODE</div>
                <div>&copy; ${new Date().getFullYear()} AAES SYSTEM ARCHITECTURE</div>
            </footer>
        </div>

        <script>
            lucide.createIcons();

            // Dynamic Metrics Fetcher
            async function updateMetrics() {
                try {
                    const res = await fetch('/api/system/metrics');
                    const data = await res.json();
                    
                    document.getElementById('val-uptime').textContent = data.uptime;
                    document.getElementById('val-load').innerHTML = \`\${data.loadAvg} <span style="font-size:11px; font-weight:500; color:var(--text-muted)">CORES: \${data.cpuCores}</span>\`;
                    document.getElementById('val-mem').innerHTML = \`\${data.memUsage}% <span style="font-size:11px; font-weight:500; color:var(--text-muted)">\${data.usedMem}</span>\`;
                    document.getElementById('val-db').textContent = data.mongoStatus;
                    document.getElementById('val-db').style.color = data.mongoColor;
                } catch (e) { console.error('Metrics sync failed', e); }
            }

            setInterval(updateMetrics, 5000);
            updateMetrics();

            // Pipeline Animation
            let currentStep = 0;
            const steps = [
                "Shield: Validating Assets",
                "Vision: Spatial Mapping",
                "Diagram: Vector Analysis",
                "OCR: Textual Reconstruction",
                "Logic: Formal Verification",
                "Integrity: Pattern Match",
                "Grading: AI Evaluation",
                "Insights: Final Analysis"
            ];

            function animatePipeline() {
                for(let i=0; i<8; i++) {
                    const el = document.getElementById('step-'+i);
                    el.classList.remove('active', 'completed');
                    if (i < currentStep) el.classList.add('completed');
                }

                document.getElementById('step-'+currentStep).classList.add('active');
                document.getElementById('pipeline-status').textContent = steps[currentStep];
                
                const progress = (currentStep / 7) * 100;
                document.getElementById('progress-bar').style.width = progress + '%';
                document.getElementById('flow-particle').style.left = progress + '%';

                currentStep = (currentStep + 1) % 8;
                setTimeout(animatePipeline, 3000);
            }

            setTimeout(animatePipeline, 1000);

            // Subtle Background Particles
            const bg = document.getElementById('neural-bg');
            for(let i=0; i<30; i++) {
                const dot = document.createElement('div');
                dot.style.position = 'absolute';
                dot.style.width = '2px';
                dot.style.height = '2px';
                dot.style.background = 'rgba(79, 70, 229, 0.15)';
                dot.style.borderRadius = '50%';
                dot.style.left = Math.random() * 100 + '%';
                dot.style.top = Math.random() * 100 + '%';
                dot.style.transition = 'all 15s linear';
                bg.appendChild(dot);
                
                setInterval(() => {
                    dot.style.left = Math.random() * 100 + '%';
                    dot.style.top = Math.random() * 100 + '%';
                }, 15000);
            }
        </script>
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
