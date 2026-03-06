import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { LayoutDashboard, Users, BookOpen } from 'lucide-react';

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
    ];

    return (
        <DashboardLayout menuItems={menuItems} role="Head of Department">
            <Outlet />
        </DashboardLayout>
    );
};

export default HODLayout;
