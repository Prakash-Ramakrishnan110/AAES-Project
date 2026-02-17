import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';

import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardHome from './pages/admin/AdminDashboard';
import Departments from './pages/admin/Departments';
import StaffList from './pages/admin/StaffList';
import StudentList from './pages/admin/StudentList';
import SubjectList from './pages/admin/SubjectList';
import Analytics from './pages/admin/Analytics';
import SemesterTransition from './pages/admin/SemesterTransition';
import BulkUpload from './pages/admin/BulkUpload';

import StaffLayout from './components/layout/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';
import AssignmentManager from './pages/staff/AssignmentManager';

import StudentLayout from './components/layout/StudentLayout';
import StudentAssignmentList from './pages/student/StudentAssignmentList';
import StudentAssignmentView from './pages/student/StudentAssignmentView';
import StudentDashboard from './pages/student/StudentDashboard';

import HODLayout from './components/layout/HODLayout';
import HODDashboard from './pages/hod/HODDashboard';
import HODStaff from './pages/hod/HODStaff';
import HODStudents from './pages/hod/HODStudents';
import HODSubjects from './pages/hod/HODSubjects';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboardHome />} />
              <Route path="departments" element={<Departments />} />
              <Route path="staff" element={<StaffList />} />
              <Route path="students" element={<StudentList />} />
              <Route path="subjects" element={<SubjectList />} />
              <Route path="bulk-upload" element={<BulkUpload />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="semester-transition" element={<SemesterTransition />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['hod']} />}>
            <Route path="/hod" element={<HODLayout />}>
              <Route path="dashboard" element={<HODDashboard />} />
              <Route path="staff" element={<HODStaff />} />
              <Route path="students" element={<HODStudents />} />
              <Route path="subjects" element={<HODSubjects />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
            <Route path="/staff" element={<StaffLayout />}>
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="assignments" element={<AssignmentManager />} />
              {/* <Route path="my-subjects" element={<MySubjects />} /> */}
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="assignments" element={<StudentAssignmentList />} />
              <Route path="assignments/:id" element={<StudentAssignmentView />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
