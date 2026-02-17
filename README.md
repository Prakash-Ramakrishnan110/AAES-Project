# AAES - Automated Assignment Evaluation System

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/Prakash-Ramakrishnan110/AAES-Project.git)

> AI-powered automated assignment evaluation system with intelligent grading, role-based dashboards, and comprehensive analytics.

## 🌟 Features

### For Students
- View assignments based on enrollment (department, semester, year)
- Submit solutions (theory/programming)
- Automated grading with instant feedback
- Performance tracking dashboard

### For Staff
- Create assignments (theory & Python programming)
- Manage test cases and model answers
- View class performance analytics
- Manual grading capability

### For HODs
- Department-scoped management
- View staff, students, and subjects
- Department performance analytics
- Real-time statistics

### For Admins
- Complete system control
- User management (CRUD + bulk upload via CSV)
- Department management
- Semester transition (batch student promotion)
- System-wide analytics

## 🚀 Tech Stack

**Frontend**: React + TypeScript + Vite + Tailwind CSS  
**Backend**: Node.js + Express + MongoDB  
**AI/ML**: Python FastAPI + Tesseract OCR + Ollama (Gemma LLM)  
**Auth**: JWT-based authentication with role-based access control

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- Python 3.8+
- Tesseract OCR (optional, for theory evaluation)
- Ollama (optional, for AI grading)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Python Service (Optional)
```bash
cd python_service
pip install -r requirements.txt
python main.py
```

## 🔧 Configuration

Create `.env` in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/aaes
PORT=5000
JWT_SECRET=your_secure_secret_key
PYTHON_SERVICE_URL=http://localhost:8000
```

## 📖 Documentation

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - MongoDB installation and configuration
- **[EVALUATION_SETUP.md](./EVALUATION_SETUP.md)** - Security features and evaluation setup

## 🎯 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prakash-Ramakrishnan110/AAES-Project.git
   cd AAES-Project
   ```

2. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Configure environment**
   - Set up MongoDB (see DATABASE_SETUP.md)
   - Create `.env` file in backend

4. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 🔐 Security Features

- Code validation (blocks dangerous imports and file operations)
- JWT authentication with role-based authorization
- Sandboxed Python execution (timeout & resource limits)
- Input validation and sanitization
- Graceful error handling

## 📊 Key Capabilities

- ✅ Automated Python code grading with test cases
- ✅ AI-powered theory answer evaluation (OCR + LLM)
- ✅ Bulk user import via CSV
- ✅ Semester transition system
- ✅ Department-scoped analytics
- ✅ Real-time dashboards for all roles

## 🤝 Contributing

This is an academic project. For improvements or bug reports, please open an issue.

## 📝 License

This project is for educational purposes.

## 👨‍💻 Author

**Prakash Ramakrishnan**  
GitHub: [@Prakash-Ramakrishnan110](https://github.com/Prakash-Ramakrishnan110)

---

Made with ❤️ for automated academic excellence
