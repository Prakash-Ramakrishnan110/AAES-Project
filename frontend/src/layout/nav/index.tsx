import { 
    LayoutDashboard, Bell, Building, Users, 
    Upload, GraduationCap, ClipboardList, BookOpen,
    Settings, PieChart, Clock, CreditCard
} from 'lucide-react';

export const adminNavigation = [
    { label: "Overview", icon: <LayoutDashboard size={20} />, path: "/admin/dashboard" },
    { label: "Departments", icon: <Building size={20} />, path: "/admin/departments" },
    { label: "Subject Registry", icon: <BookOpen size={20} />, path: "/admin/subjects" },
    { label: "Staff Directory", icon: <Users size={20} />, path: "/admin/staff" },
    { label: "Student Census", icon: <GraduationCap size={20} />, path: "/admin/students" },
    { label: "Analytics", icon: <PieChart size={20} />, path: "/admin/analytics" },
    { label: "OCR Operations", icon: <Upload size={20} />, path: "/admin/ocr" },
    { label: "Bulk Import", icon: <Upload size={20} />, path: "/admin/bulk-upload" },
    { label: "Audit Registry", icon: <ClipboardList size={20} />, path: "/admin/audit-logs" },
    { label: "Temporal Matrix", icon: <Clock size={20} />, path: "/admin/schedule" },
    { label: "Nexus Ledger", icon: <CreditCard size={20} />, path: "/admin/finance" },
    { label: "Communications", icon: <Bell size={20} />, path: "/admin/communications" },
    { label: "System Config", icon: <Settings size={20} />, path: "/admin/settings" },
    { label: "My Profile", icon: <Users size={20} />, path: "/profile" },
    { label: "Account Settings", icon: <Settings size={20} />, path: "/settings" },
];
 
export const hodNavigation = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/hod/dashboard" },
    { label: "Curriculum Matrix", icon: <BookOpen size={20} />, path: "/hod/subjects" },
    { label: "Faculty Node", icon: <Users size={20} />, path: "/hod/staff" },
    { label: "Student Base", icon: <GraduationCap size={20} />, path: "/hod/students" },
    { label: "Intel Analytics", icon: <PieChart size={20} />, path: "/hod/analytics" },
    { label: "Bulk Protocol", icon: <Upload size={20} />, path: "/hod/bulk-upload" },
    { label: "My Profile", icon: <Users size={20} />, path: "/profile" },
    { label: "Account Settings", icon: <Settings size={20} />, path: "/settings" },
];
 
export const staffNavigation = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/staff/dashboard" },
    { label: "Instructional Nodes", icon: <BookOpen size={20} />, path: "/staff/subjects" },
    { label: "Assignments", icon: <ClipboardList size={20} />, path: "/staff/assignments" },
    { label: "Submissions", icon: <PieChart size={20} />, path: "/staff/submissions" },
    { label: "Student Census", icon: <Users size={20} />, path: "/staff/students" },
    { label: "Resource Upload", icon: <Upload size={20} />, path: "/staff/notes" },
    { label: "Study Materials", icon: <BookOpen size={20} />, path: "/staff/resources" },
    { label: "My Profile", icon: <Users size={20} />, path: "/profile" },
    { label: "Account Settings", icon: <Settings size={20} />, path: "/settings" },
];
 
export const studentNavigation = [
    { label: "Overview", icon: <LayoutDashboard size={20} />, path: "/student/dashboard" },
    { label: "Coursework", icon: <ClipboardList size={20} />, path: "/student/assignments" },
    { label: "Notes AI", icon: <PieChart size={20} />, path: "/student/notes-ai" },
    { label: "Study Resources", icon: <BookOpen size={20} />, path: "/student/resources" },
    { label: "My Profile", icon: <Users size={20} />, path: "/profile" },
    { label: "Account Settings", icon: <Settings size={20} />, path: "/settings" },
];
