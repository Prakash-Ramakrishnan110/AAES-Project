import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffList from './pages/admin/StaffList';
import StudentList from './pages/admin/StudentList';
import SubjectList from './pages/admin/SubjectList';
import Departments from './pages/admin/Departments';
import BulkUpload from './pages/admin/BulkUpload';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSettings from './pages/admin/AdminSettings';
import Analytics from './pages/admin/Analytics';
import OCRManagement from './pages/admin/OCRManagement';
import SemesterTransition from './pages/admin/SemesterTransition';

import StaffLayout from './components/layout/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';
import InternalMarksEntry from './pages/staff/InternalMarksEntry';
import MySubjects from './pages/staff/MySubjects';
import MyAssignedWork from './pages/staff/MyAssignedWork';
import StudyResources from './pages/staff/StudyResources';
import Evaluation from './pages/staff/Evaluation';
import UnifiedAssignments from './pages/staff/UnifiedAssignments';
import StaffCommunications from './pages/staff/StaffCommunications';
import StaffStudentList from './pages/staff/StaffStudentList';
import NotesUpload from './pages/staff/NotesUpload';

// StaffCommunications is role-agnostic (fetches current user's notifications)
const CommunicationsPage = StaffCommunications;

import StudentLayout from './components/layout/StudentLayout';
import StudentAssignmentList from './pages/student/StudentAssignmentList';
import StudentAssignmentView from './pages/student/StudentAssignmentView';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentDocumentViewer from './pages/student/StudentDocumentViewer';
import StudentOnboarding from './pages/student/StudentOnboarding';
import StudentStudyResources from './pages/student/StudentStudyResources';
import StudentAssignedWork from './pages/student/StudentAssignedWork';
import NotesAI from './pages/student/NotesAI';

import HODLayout from './components/layout/HODLayout';
import HODDashboard from './pages/hod/HODDashboard';
import HODStaff from './pages/hod/HODStaff';
import HODStudents from './pages/hod/HODStudents';
import HODSubjects from './pages/hod/HODSubjects';
import HODDirectory from './pages/hod/HODDirectory';
import HODWorkAssignments from './pages/hod/HODWorkAssignments';
import HODConsolidatedReports from './pages/hod/HODConsolidatedReports';
import HODInternalMarksView from './pages/hod/HODInternalMarksView';
import HODAnalytics from './pages/hod/HODAnalytics';
import Profile from './pages/profile/Profile';
import Settings from './pages/profile/Settings';
import ProfileLayout from './components/layout/ProfileLayout';
import StudentMarksView from './pages/student/StudentMarksView';
import StudentInternalMarks from './pages/student/StudentInternalMarks';


function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              {/* Profile and Settings with specific Layout for Sidebar support */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'hod', 'staff', 'student']} />}>
                <Route element={<ProfileLayout />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>


              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="communications" element={<CommunicationsPage />} />
                  <Route path="staff" element={<StaffList />} />
                  <Route path="students" element={<StudentList />} />
                  <Route path="subjects" element={<SubjectList />} />
                  <Route path="departments" element={<Departments />} />
                  <Route path="bulk-upload" element={<BulkUpload />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="ocr" element={<OCRManagement />} />
                  <Route path="semester-transition" element={<SemesterTransition />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['hod']} />}>
                <Route path="/hod" element={<HODLayout />}>
                  <Route path="dashboard" element={<HODDashboard />} />
                  <Route path="communications" element={<CommunicationsPage />} />
                  <Route path="staff" element={<HODStaff />} />
                  <Route path="students" element={<HODStudents />} />
                  <Route path="subjects" element={<HODSubjects />} />
                  <Route path="directory" element={<HODDirectory />} />
                  <Route path="my-work" element={<MyAssignedWork />} />
                  <Route path="consolidated-reports" element={<HODConsolidatedReports />} />
                  <Route path="work-assignments" element={<HODWorkAssignments />} />
                  <Route path="internal-marks" element={<HODInternalMarksView />} />
                  <Route path="analytics" element={<HODAnalytics />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
                <Route path="/staff" element={<StaffLayout />}>
                  <Route path="dashboard" element={<StaffDashboard />} />
                  <Route path="communications" element={<StaffCommunications />} />
                  <Route path="students" element={<StaffStudentList />} />
                  <Route path="my-subjects" element={<MySubjects />} />
                  <Route path="assignments" element={<UnifiedAssignments />} />
                  <Route path="evaluation" element={<Evaluation />} />
                  <Route path="internal-marks/:subjectId" element={<InternalMarksEntry />} />
                  <Route path="study-resources/:subjectId" element={<StudyResources />} />
                  <Route path="knowledge-base" element={<NotesUpload />} />
                  <Route path="my-work" element={<MyAssignedWork />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student" element={<StudentLayout />}>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="communications" element={<CommunicationsPage />} />
                  <Route path="assignments" element={<StudentAssignmentList />} />
                  <Route path="assignments/:id" element={<StudentAssignmentView />} />
                  <Route path="resources" element={<StudentStudyResources />} />
                  <Route path="resources/:id" element={<StudentDocumentViewer />} />
                  <Route path="marks" element={<StudentMarksView />} />
                  <Route path="notes-ai" element={<NotesAI />} />
                  <Route path="internal-marks" element={<StudentInternalMarks />} />
                  <Route path="my-work" element={<StudentAssignedWork />} />
                </Route>
                {/* Separate layout-free route for onboarding */}
                <Route path="/student/onboarding" element={<StudentOnboarding />} />
              </Route>



              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
