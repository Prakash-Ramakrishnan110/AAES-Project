import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { LayoutDashboard, Users, BookOpen, Settings, CheckSquare, CalendarDays, FileText, FileBadge, Bell } from 'lucide-react';

const HODLayout = () => {
    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/hod/dashboard" },
        {
            icon: <Users className="w-5 h-5" />,
            label: "Academic Ops",
            to: "/hod/subjects",
            items: [
                { label: "Subject Management", to: "/hod/subjects" },
                { label: "Attendance Tracker", to: "/hod/attendance" },
                { label: "Internal Assessments", to: "/hod/internal-marks" },
                { label: "Class Activity Log", to: "/hod/activity-log" },
                { label: "Governance Hub", to: "/hod/governance" },
            ]
        },
        {
            icon: <BookOpen className="w-5 h-5" />,
            label: "Faculty & Students",
            to: "/hod/staff",
            items: [
                { label: "Faculty Directory", to: "/hod/staff" },
                { label: "Student Directory", to: "/hod/students" },
                { label: "Class Advisors", to: "/hod/class-advisors" },
            ]
        },
        {
            icon: <LayoutDashboard className="w-5 h-5" />,
            label: "Insights",
            to: "/hod/analytics",
            items: [
                { label: "Academic Analytics", to: "/hod/analytics" },
                { label: "Department Map", to: "/hod/directory" },
            ]
        },
        {
            icon: <Bell className="w-5 h-5" />,
            label: "Communications",
            to: "/hod/communications"
        },
        {
            icon: <CheckSquare className="w-5 h-5" />,
            label: "Work Assignments",
            to: "/hod/work-assignments"
        },
        {
            icon: <CalendarDays className="w-5 h-5" />,
            label: "Class Timetables",
            to: "/hod/timetables"
        },
        {
            icon: <FileText className="w-5 h-5" />,
            label: "Student Leaves",
            to: "/hod/leaves"
        },
        {
            icon: <FileBadge className="w-5 h-5" />,
            label: "Document Vault",
            to: "/hod/documents"
        },
        { icon: <Settings className="w-5 h-5" />, label: "Settings", to: "/settings" },
    ];

    return (
        <DashboardLayout menuItems={menuItems} role="Head of Department">
            <Outlet />
        </DashboardLayout>
    );
};

export default HODLayout;
