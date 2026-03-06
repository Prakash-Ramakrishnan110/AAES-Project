import { lazy } from 'react';
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
import InternalMarksEntry from './pages/staff/InternalMarksEntry';
import MySubjects from './pages/staff/MySubjects';
import StudyResources from './pages/staff/StudyResources';
import Evaluation from './pages/staff/Evaluation';
import UnifiedAssignments from './pages/staff/UnifiedAssignments';
import ClassAdvisorDashboard from './pages/staff/ClassAdvisorDashboard';
import AttendanceDashboard from './pages/staff/AttendanceDashboard';
import AttendanceMarking from './pages/staff/AttendanceMarking';
import SubjectAttendanceSummary from './pages/staff/SubjectAttendanceSummary';
import AdvisorStudentList from './pages/staff/advisor/AdvisorStudentList';
import AdvisorAttendance from './pages/staff/advisor/AdvisorAttendance';
import AdvisorPerformance from './pages/staff/advisor/AdvisorPerformance';
import AdvisorNotes from './pages/staff/advisor/AdvisorNotes';
import AdvisorReports from './pages/staff/advisor/AdvisorReports';
import StaffCCM from './pages/staff/advisor/StaffCCM';
import MyMentees from './pages/staff/MyMentees';
import MentorshipGovernance from './pages/staff/MentorshipGovernance';
import ClassGovernance from './pages/staff/ClassGovernance';
import AttendanceAlerts from './pages/staff/AttendanceAlerts';
import MentorAssignment from './pages/staff/MentorAssignment';

import StudentLayout from './components/layout/StudentLayout';
import StudentAssignmentList from './pages/student/StudentAssignmentList';
import StudentAssignmentView from './pages/student/StudentAssignmentView';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentStudyResources from './pages/student/StudentStudyResources';
import StudentDocumentViewer from './pages/student/StudentDocumentViewer';
import StudentOnboarding from './pages/student/StudentOnboarding';
import HODLayout from './components/layout/HODLayout';
import HODDashboard from './pages/hod/HODDashboard';
import DepartmentGovernance from './pages/hod/DepartmentGovernance';
import InternalPatternManager from './pages/hod/InternalPatternManager';
import HODStaff from './pages/hod/HODStaff';
import HODStudents from './pages/hod/HODStudents';
import HODSubjects from './pages/hod/HODSubjects';
import HODDirectory from './pages/hod/HODDirectory';
import HODClassAdvisors from './pages/hod/HODClassAdvisors';
import HODAnalytics from './pages/hod/HODAnalytics';
import HODInternalMarksView from './pages/hod/HODInternalMarksView';
import HODConsolidatedReports from './pages/hod/HODConsolidatedReports';
import Profile from './pages/profile/Profile';
import Settings from './pages/profile/Settings';
import StudentMarksView from './pages/student/StudentMarksView';
import StudentInternalMarks from './pages/student/StudentInternalMarks';
import PrincipalLayout from './components/layout/PrincipalLayout';
import PrincipalDashboard from './pages/principal/PrincipalDashboard';
const PrincipalInfrastructure = lazy(() => import('./pages/principal/PrincipalInfrastructure'));
const PrincipalRisk = lazy(() => import('./pages/principal/PrincipalRisk'));
const PrincipalAnalytics = lazy(() => import('./pages/principal/PrincipalAnalytics'));
const PrincipalStaff = lazy(() => import('./pages/principal/PrincipalStaff'));
const PrincipalAuditLogs = lazy(() => import('./pages/principal/PrincipalAuditLogs'));
const PrincipalSettings = lazy(() => import('./pages/principal/PrincipalSettings'));

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
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin', 'hod', 'staff', 'student', 'principal']} />}>
                <Route index element={<Profile />} />
                <Route path=":id" element={<Profile />} />
              </Route>

              <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin', 'hod', 'staff', 'student', 'principal']} />}>
                <Route index element={<Settings />} />
              </Route>

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
                  <Route path="internal-pattern/:subjectId" element={<InternalPatternManager />} />
                  <Route path="attendance" element={<AttendanceDashboard />} />
                  <Route path="attendance/:subjectId/summary" element={<SubjectAttendanceSummary />} />
                  <Route path="directory" element={<HODDirectory />} />
                  <Route path="class-advisors" element={<HODClassAdvisors />} />
                  <Route path="analytics" element={<HODAnalytics />} />
                  <Route path="governance" element={<DepartmentGovernance />} />
                  <Route path="internal-marks" element={<HODInternalMarksView />} />
                  <Route path="consolidated-reports" element={<HODConsolidatedReports />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
                <Route path="/staff" element={<StaffLayout />}>
                  <Route path="dashboard" element={<StaffDashboard />} />
                  <Route path="my-subjects" element={<MySubjects />} />
                  <Route path="assignments" element={<UnifiedAssignments />} />
                  <Route path="evaluation" element={<Evaluation />} />
                  <Route path="attendance" element={<AttendanceDashboard />} />
                  <Route path="attendance/:subjectId" element={<AttendanceMarking />} />
                  <Route path="internal-marks/:subjectId" element={<InternalMarksEntry />} />
                  <Route path="attendance/:subjectId/summary" element={<SubjectAttendanceSummary />} />
                  <Route path="study-resources/:subjectId" element={<StudyResources />} />
                  <Route path="class-governance" element={<ClassGovernance />} />
                  <Route path="attendance-alerts" element={<AttendanceAlerts />} />
                  <Route path="mentor-assignment" element={<MentorAssignment />} />
                  <Route path="advisor-dashboard" element={<ClassAdvisorDashboard />} />
                  <Route path="advisor/students" element={<AdvisorStudentList />} />
                  <Route path="advisor/attendance" element={<AdvisorAttendance />} />
                  <Route path="advisor/performance" element={<AdvisorPerformance />} />
                  <Route path="advisor/notes" element={<AdvisorNotes />} />
                  <Route path="advisor/reports" element={<AdvisorReports />} />
                  <Route path="ccm" element={<StaffCCM />} />
                  <Route path="mentorship/my-mentees" element={<MyMentees />} />
                  <Route path="mentorship-governance" element={<MentorshipGovernance />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student" element={<StudentLayout />}>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="assignments" element={<StudentAssignmentList />} />
                  <Route path="assignments/:id" element={<StudentAssignmentView />} />
                  <Route path="resources" element={<StudentStudyResources />} />
                  <Route path="resources/:id" element={<StudentDocumentViewer />} />
                  <Route path="attendance" element={<AttendanceDashboard />} />
                  <Route path="marks" element={<StudentMarksView />} />
                  <Route path="internal-marks" element={<StudentInternalMarks />} />
                </Route>
                {/* Separate layout-free route for onboarding */}
                <Route path="/student/onboarding" element={<StudentOnboarding />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['principal']} />}>
                <Route path="/principal" element={<PrincipalLayout />}>
                  <Route path="dashboard" element={<PrincipalDashboard />} />
                  <Route path="departments" element={<PrincipalInfrastructure />} />
                  <Route path="risk" element={<PrincipalRisk />} />
                  <Route path="analytics" element={<PrincipalAnalytics />} />
                  <Route path="staff" element={<PrincipalStaff />} />
                  <Route path="audit" element={<PrincipalAuditLogs />} />
                  <Route path="settings" element={<PrincipalSettings />} />
                </Route>
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
